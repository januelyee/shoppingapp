package com.januelyee.shoppingcart.domain.abstraction;

import com.januelyee.shoppingcart.domain.template.ProductAdminService;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.template.personnel.ProductCatalogManager;
import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;

import java.util.List;

public abstract class AbstractProductAdminService implements ProductAdminService {

    private ProductCatalogManager productCatalogManager;

    @Override
    public void setProductCatalogManager(ProductCatalogManager productCatalogManager) {
        this.productCatalogManager = productCatalogManager;
    }

    @Override
    public ProductCatalogManager getProductCatalogManager() {
        return productCatalogManager;
    }

    @Override
    public List<Product> getProductsFromCatalog() {
        checkState();
        return getProductCatalogManager().getProducts();
    }

    @Override
    public void addProductToCatalog(Product product) {
        checkInput(product);
        getProductCatalogManager().addProduct(product);
    }

    @Override
    public void removeProductFromCatalog(String productNumber) {
        checkState();
        if (productNumber != null) {
            getProductCatalogManager().removeProductFromCatalog(productNumber);
        }
    }

    @Override
    public void updateProductFromCatalog(Product product) {
        checkState();
        checkInput(product);
        getProductCatalogManager().updateProduct(product);
    }

    @Override
    public Product getProductInformationFromCatalog(String productNumber) {
        checkState();
        if (productNumber == null || productNumber.equals("")) {
            throw new InvalidInputException("Product number is not valid!");
        }
        return getProductCatalogManager().getProductByProductNumber(productNumber);
    }

    @Override
    public List<Product> getProductsWithFollowingAttributes(List<ProductAttribute> attributes) {
        checkState();
        throw new UnsupportedOperationException("This method is not implemented yet!");
    }

    private void checkInput(Product product) {
        String emptyString = "";

        if (product == null) {
            throw new InvalidInputException("Product is not defined!");
        }

        if (product.getName() == null || product.getName().equals(emptyString)) {
            throw new InvalidInputException("Product name is not defined!");
        }

        if (product.getPrice() < 0) {
            throw new InvalidInputException("Product price is not valid!");
        }

        if (product.getProductNumber() == null || product.getProductNumber().equals(emptyString)) {
            throw new InvalidInputException("Product number is not valid!");
        }
    }

    private void checkState() {
        if (getProductCatalogManager() == null) {
            throw new IllegalStateException("ProductAdminService state is not setup properly!");
        }
    }
}
