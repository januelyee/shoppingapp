package com.januelyee.shoppingcart.daos.ejb.elasticsearch.test;

import com.google.gson.Gson;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.elasticsearch.objects.ProductAttributeObject;
import com.januelyee.shoppingcart.domain.elasticsearch.objects.ProductObject;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.entity.ContentType;
import org.apache.http.nio.entity.NStringEntity;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.ResponseListener;
import org.elasticsearch.client.RestClient;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;

public class ConnectionTest {

    private static final Random random = new Random();

    private static final Logger log = LoggerFactory.getLogger(ConnectionTest.class);

    @Test
    public void testConnect() {
        String AWS_ELASTICSEARCH_ENDPOINT = "search-januelyee-s5ouuqqbsfcxoxa4zybe3qpujq.ca-central-1.es.amazonaws.com";
        RestClient restClient = RestClient.builder(new HttpHost(AWS_ELASTICSEARCH_ENDPOINT, 443, "https")).build();

        ProductAttribute productAttribute = new ProductAttributeObject();
        productAttribute.setName("Test");
        productAttribute.setValue("Test Value");


        Product product = new ProductObject();
        product.setName("Test Product");
        product.setPrice(10.00);
        product.setAttribute(productAttribute);

        String json = new Gson().toJson(product);

        ResponseListener responseListener = new ResponseListener() {
            @Override
            public void onSuccess(Response response) {
                log.debug("Success, status: " + response.getStatusLine().getStatusCode());
            }

            @Override
            public void onFailure(Exception exception) {
                log.error("Failed!", exception);
            }
        };

        HttpEntity entity = new NStringEntity(json, ContentType.APPLICATION_JSON);
        Map<String, String> params = Collections.emptyMap();

        try {
            restClient.performRequest("POST", "/shopping/product/", params, entity);
        } catch (IOException e) {
            e.printStackTrace();
        }
        /*try {
            Response response = restClient.performRequest("GET", "/shopping/product/_search", params);
            HttpEntity responseEntity = response.getEntity();

            if (responseEntity != null) {
                String retSrc = EntityUtils.toString(responseEntity);
                // parsing JSON
                JSONObject result = new JSONObject(retSrc); //Convert String to JSON Object

                JSONArray productCases = result.getJSONObject("hits").getJSONArray("hits");

                List<Product> productList = new ArrayList<>();
                for (int x = 0; x < productCases.length(); x++) {
                    JSONObject productCase = productCases.getJSONObject(x);
                    JSONObject productJson = productCase.getJSONObject("_source");

                    Product p = new ProductObject();
                    ((ProductObject) p).setId(productCase.getString("_id"));
                    p.setName(productJson.getString("name"));
                    p.setPrice(productJson.getDouble("price"));

                    JSONArray attributesJSONArray = productJson.getJSONArray("productAttributes");
                    for (int i = 0; i < attributesJSONArray.length(); i++) {
                        ProductAttribute a = new ProductAttributeObject();
                        JSONObject aJson = attributesJSONArray.getJSONObject(i);

                        a.setName(aJson.getString("name"));
                        a.setValue(aJson.getString("value"));
                        a.setSequenceNumber(aJson.getInt("sequenceNumber"));
                        p.setAttribute(a);
                    }

                    productList.add(p);
                }

                log.debug("" + productList);
            }

        } catch (IOException | JSONException e) {
            e.printStackTrace();
        }*/
    }
}
