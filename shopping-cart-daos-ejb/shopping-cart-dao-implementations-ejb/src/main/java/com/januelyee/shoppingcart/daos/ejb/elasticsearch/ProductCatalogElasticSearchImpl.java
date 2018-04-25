package com.januelyee.shoppingcart.daos.ejb.elasticsearch;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.januelyee.shoppingcart.daos.ejb.exceptions.DAOInvalidInputException;
import com.januelyee.shoppingcart.daos.ejb.interfaces.ProductCatalogLocal;
import com.januelyee.shoppingcart.daos.ejb.interfaces.ProductFactoryLocal;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.elasticsearch.objects.ProductAttributeObject;
import com.januelyee.shoppingcart.domain.elasticsearch.objects.ProductObject;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.http.HttpEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.nio.entity.NStringEntity;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.elasticsearch.client.ResponseListener;
import org.elasticsearch.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import java.io.IOException;
import java.util.*;

@Stateless(mappedName = "ProductCatalogElasticSearchImpl")
public class ProductCatalogElasticSearchImpl extends AbstractProductCatalogElasticSearchImpl implements ProductCatalogLocal {

    private static final Logger log = LoggerFactory.getLogger(ProductCatalogElasticSearchImpl.class);

    @EJB(beanName = "ProductFactoryElasticSearchImpl")
    private ProductFactoryLocal productFactoryLocal;

    @PostConstruct
    private void injectSuperclassDependencies() {
        super.setStorageFactory(productFactoryLocal);
    }

    @Override
    protected String getObjectId(Product product) {
        if (product instanceof ProductObject) {
            return ((ProductObject) product).getId();
        }

        throw new ClassCastException("Object is not a ProductObject instance!");
    }

    @Override
    protected void checkForInputErrors(Product product) {
        if (product == null) {
            throw new DAOInvalidInputException("Product is not defined!");
        }

        if (product.getProductNumber() == null || product.getProductNumber().equals("")) {
            throw new DAOInvalidInputException("The object to update does not have a product number!");
        }

        if (product.getName() == null || product.getName().equals("")) {
            throw new DAOInvalidInputException("Product name is not defined!");
        }

        if (product.getPrice() < 0) {
            throw new DAOInvalidInputException("Product pricing is invalid");
        }
    }

    @Override
    protected Product populateObjectFields(JSONObject elasticSearchJSONObject, String id) {
        Product product = new ProductObject();

        try {
            product.setName(elasticSearchJSONObject.getString("name"));
            product.setPrice(elasticSearchJSONObject.getDouble("price"));
            product.setProductNumber(elasticSearchJSONObject.getString("productNumber"));

            if (!elasticSearchJSONObject.isNull("productAttributes")) {
                JSONArray attributesJSONArray = elasticSearchJSONObject.getJSONArray("productAttributes");
                for (int i = 0; i < attributesJSONArray.length(); i++) {
                    ProductAttribute a = new ProductAttributeObject();
                    JSONObject aJson = attributesJSONArray.getJSONObject(i);

                    a.setName(aJson.getString("name"));
                    a.setValue(aJson.getString("value"));
                    a.setSequenceNumber(aJson.getInt("sequenceNumber"));
                    product.setAttribute(a);
                }
            }

            ((ProductObject) product).setId(id);

        } catch (JSONException e) {
            e.printStackTrace();
        }

        return product;
    }

    @Override
    protected Class getObjectClass() {
        return ProductObject.class;
    }

    @Override
    protected String getElasticSearchObjectType() {
        return "product";
    }

    @Override
    public List<Product> findByProductNumbers(Collection<String> productNumbers) {
        if (CollectionUtils.isEmpty(productNumbers)) {
            return new ArrayList<>();
        }

        List<Product> all = findAll();
        List<Product> matches = new ArrayList<>();
        for (Product product : all) {
            if (productNumbers.contains(product.getProductNumber())) {
                matches.add(product);
            }
        }
        return matches;
    }

    @Override
    public void update(Product t) {
        checkForInputErrors(t);

        log.debug("Input check passed...");
        List<String> productNumbers = new ArrayList<>();
        productNumbers.add(t.getProductNumber());
        List<Product> result = findByProductNumbers(productNumbers);

        if (!result.isEmpty()) {
            try {
                Product found = result.get(0);
                JsonElement productJsonElement = new Gson().toJsonTree(t);
                JsonObject productJsonObject = new JsonObject();
                productJsonObject.add("doc", productJsonElement);
                String object = new Gson().toJson(productJsonObject);

                log.debug("Preparing object to be updated...");
                HttpEntity entity = new NStringEntity(object, ContentType.APPLICATION_JSON);
                Map<String, String> params = Collections.emptyMap();
                ResponseListener responseListener = new CRUDOperationsResponseListener();

                log.debug("Calling ElasticSearch REST endpoint to update object...");
                RestClient restClient = getRestClient();
                String apiEndpoint = ELASTICSEARCH_INDEX + getElasticSearchObjectType() +"/" + getObjectId(found) + "/_update";
                restClient.performRequest("POST", apiEndpoint, params, entity);

            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
