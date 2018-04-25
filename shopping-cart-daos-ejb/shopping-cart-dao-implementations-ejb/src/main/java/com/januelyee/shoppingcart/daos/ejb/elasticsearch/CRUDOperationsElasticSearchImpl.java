package com.januelyee.shoppingcart.daos.ejb.elasticsearch;

import com.google.gson.Gson;
import com.januelyee.shoppingcart.daos.ejb.exceptions.DAOInvalidInputException;
import com.januelyee.shoppingcart.daos.ejb.exceptions.DAORecordNotFoundException;
import com.januelyee.shoppingcart.daos.ejb.exceptions.DAOShoppingException;
import com.januelyee.shoppingcart.domain.template.CRUDOperations;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.entity.ContentType;
import org.apache.http.nio.entity.NStringEntity;
import org.apache.http.util.EntityUtils;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.ResponseListener;
import org.elasticsearch.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;

public abstract class CRUDOperationsElasticSearchImpl<T> implements CRUDOperations<T> {

    private static final Logger log = LoggerFactory.getLogger(CRUDOperationsElasticSearchImpl.class);

    private static final String AWS_ELASTICSEARCH_ENDPOINT_HOSTNAME = "search-januelyee-s5ouuqqbsfcxoxa4zybe3qpujq.ca-central-1.es.amazonaws.com";
    private static final int AWS_ELASTICSEARCH_ENDPOINT_PORT = 9200;
    private static final String AWS_ELASTICSEARCH_ENDPOINT_SCHEME = "https";

    protected static final String ELASTICSEARCH_OBJECT_ID_KEY = "_id";
    protected static final String ELASTICSEARCH_SEARCH_KEYWORD = "_search";
    protected static final String ELASTICSEARCH_INDEX = "/shopping/";
    protected static final String ELASTICSEARCH_SEARCH_HITS_KEY = "hits";
    protected static final String ELASTICSEARCH_SEARCH_FINAL_SOURCE_KEY = "_source";

    protected abstract String getObjectId(T t);
    protected abstract void checkForInputErrors(T t);
    protected abstract T populateObjectFields(JSONObject elasticSearchJSONObject, String id);
    protected abstract Class getObjectClass();
    protected abstract String getElasticSearchObjectType();

    protected RestClient getRestClient() {
        return RestClient.builder(new HttpHost(AWS_ELASTICSEARCH_ENDPOINT_HOSTNAME, AWS_ELASTICSEARCH_ENDPOINT_PORT, AWS_ELASTICSEARCH_ENDPOINT_SCHEME)).build();
    }

    private String createWithReturn(T t) {
        checkForInputErrors(t);

        log.debug("Input check passed...");
        String object = new Gson().toJson(t);

        log.debug("Preparing object to be saved...");
        HttpEntity entity = new NStringEntity(object, ContentType.APPLICATION_JSON);
        Map<String, String> params = Collections.emptyMap();
        ResponseListener responseListener = new CRUDOperationsResponseListener();

        log.debug("Calling ElasticSearch REST endpoint to save object...");
        RestClient restClient = getRestClient();
        String apiEndpoint = ELASTICSEARCH_INDEX + getElasticSearchObjectType() + "/";
        try {
            Response response = restClient.performRequest("POST", apiEndpoint, params, entity);
            log.debug("Successfully saved object!");
            return response.toString();

        } catch (IOException e) {
            String errorString = "A system error has occurred adding " + getObjectClass().getSimpleName() + " [" + t + "]";
            log.error(errorString, e);
            throw new DAOShoppingException(errorString, e);
        }
    }

    @Override
    public void create(T t) {
        String responseStr = createWithReturn(t);
        log.debug("Successfully created: " + responseStr);
    }

    @Override
    public void delete(T t) {
        if (getObjectId(t) == null) {
            throw new DAOInvalidInputException("The object to delete does not have an ID!");
        }

        Map<String, String> params = Collections.emptyMap();

        log.debug("Calling ElasticSearch REST endpoint to delete object with ID [" + getObjectId(t) + "]");
        RestClient restClient = getRestClient();
        String apiEndpoint = ELASTICSEARCH_INDEX + getElasticSearchObjectType() +"/" + getObjectId(t);
        try {
            restClient.performRequest("DELETE", apiEndpoint, params);
        } catch (IOException e) {
            String errorString = "A system error has occurred deleting " + getObjectClass().getSimpleName() + " [" + t + "]";
            log.error(errorString, e);
            throw new DAOShoppingException(errorString, e);
        }
    }

    @Override
    public void deleteAll(Collection<T> toDelete) {
        for (T t : toDelete) {
            delete(t);
        }
    }

    @Override
    public List<T> findAll() {
        try {
            RestClient restClient = getRestClient();
            Map<String, String> params = Collections.emptyMap();
            String apiEndpoint = ELASTICSEARCH_INDEX + getElasticSearchObjectType() + "/" + ELASTICSEARCH_SEARCH_KEYWORD;
            Response response = restClient.performRequest("GET", apiEndpoint, params);
            HttpEntity responseEntity = response.getEntity();

            if (responseEntity == null) {
                return new ArrayList<>();
            }

            String jsonResponseEntityString = EntityUtils.toString(responseEntity);
            JSONObject result = new JSONObject(jsonResponseEntityString);

            JSONArray objectContainers = result.getJSONObject(ELASTICSEARCH_SEARCH_HITS_KEY).getJSONArray(ELASTICSEARCH_SEARCH_HITS_KEY);

            List<T> foundList = new ArrayList<>();
            for (int x = 0; x < objectContainers.length(); x++) {
                JSONObject objectContainer = objectContainers.getJSONObject(x);
                JSONObject objectJson = objectContainer.getJSONObject(ELASTICSEARCH_SEARCH_FINAL_SOURCE_KEY);
                T t = populateObjectFields(objectJson, objectContainer.getString(ELASTICSEARCH_OBJECT_ID_KEY));

                foundList.add(t);
            }

            return foundList;

        } catch (JSONException | IOException e) {
            String errorString = "A system error has occurred finding all " + getObjectClass().getSimpleName() + "objects";
            log.error(errorString, e);
            throw new DAOShoppingException(errorString, e);
        }
    }

    @Override
    public T find(T t) {
        if (getObjectId(t) == null) {
            throw new DAOInvalidInputException("The object to find does not have an ID!");
        }

        Map<String, String> params = Collections.emptyMap();

        log.debug("Calling ElasticSearch REST endpoint to delete object with ID [" + getObjectId(t) + "]");
        RestClient restClient = getRestClient();
        String apiEndpoint = ELASTICSEARCH_INDEX + getElasticSearchObjectType() +"/" + getObjectId(t);
        try {
            Response response = restClient.performRequest("GET", apiEndpoint, params);
            HttpEntity responseEntity = response.getEntity();

            if (responseEntity == null) {
                throw new DAORecordNotFoundException("ElasticSearch object with ID [" + getObjectId(t) + "] not found");
            }

            String jsonResponseEntityString = EntityUtils.toString(responseEntity);
            JSONObject objectContainer = new JSONObject(jsonResponseEntityString);
            JSONObject objectJson = objectContainer.getJSONObject(ELASTICSEARCH_SEARCH_FINAL_SOURCE_KEY);

            return populateObjectFields(objectJson, objectContainer.getString(ELASTICSEARCH_OBJECT_ID_KEY));

        } catch (JSONException | IOException e) {
            String errorString = "A system error has occurred finding ElasticSearch object with ID [" + getObjectId(t) + "]";
            log.error(errorString, e);
            throw new DAOShoppingException(errorString, e);
        }
    }
}
