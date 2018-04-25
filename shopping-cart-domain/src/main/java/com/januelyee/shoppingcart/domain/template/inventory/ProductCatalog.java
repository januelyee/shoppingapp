package com.januelyee.shoppingcart.domain.template.inventory;

import com.januelyee.shoppingcart.domain.template.Storage;

import java.util.Collection;
import java.util.List;

/**
 * Represents a catalog of products.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */

public interface ProductCatalog extends Storage<Product> {
    List<Product> findByProductNumbers(Collection<String> productNumbers);
}
