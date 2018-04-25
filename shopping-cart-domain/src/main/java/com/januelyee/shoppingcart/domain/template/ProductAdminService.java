package com.januelyee.shoppingcart.domain.template;

import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.template.personnel.ProductCatalogManager;

import java.util.List;

/**
 * Represents product catalog administration services and operations.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */

public interface ProductAdminService {
    void setProductCatalogManager(ProductCatalogManager productCatalogManager);
    ProductCatalogManager getProductCatalogManager();

    List<Product> getProductsFromCatalog();
    void addProductToCatalog(Product product);
    void removeProductFromCatalog(String productNumber);
    void updateProductFromCatalog(Product product);
    Product getProductInformationFromCatalog(String productNumber);
    List<Product> getProductsWithFollowingAttributes(List<ProductAttribute> attributes);
}
