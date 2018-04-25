package com.januelyee.shoppingcart.domain.elasticsearch.objects;

import java.io.Serializable;

public interface ElasticSearchObject extends Serializable {
    String getId();
    void setId(String id);
}
