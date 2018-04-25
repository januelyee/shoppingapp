package com.januelyee.shoppingcart.domain.template.personnel;

import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.template.inventory.ProductCatalog;

import java.util.List;

public interface ProductCatalogManager {

    void addProduct(Product product);
    void updateProduct(Product product);
    void removeProductFromCatalog(String productNumber);
    Product getProductByProductNumber(String productNumber);

    ProductCatalog getProductCatalog();
    void setProductCatalog(ProductCatalog productCatalog);
    List<Product> getProducts();
    List<Product> getProductsWithFollowingAttributes(List<ProductAttribute> attributes);
}
