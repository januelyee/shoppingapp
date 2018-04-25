package com.januelyee.shoppingcart.daos.ejb.elasticsearch;

import org.elasticsearch.client.Response;
import org.elasticsearch.client.ResponseListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CRUDOperationsResponseListener implements ResponseListener {

    private static final Logger log = LoggerFactory.getLogger(CRUDOperationsResponseListener.class);

    @Override
    public void onSuccess(Response response) {
        log.debug("ElasticSearch transaction successful, status: " + response.getStatusLine().getStatusCode());
    }

    @Override
    public void onFailure(Exception e) {
        log.error("ElasticSearch transaction failed!", e);
    }
}
