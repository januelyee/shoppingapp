package com.januelyee.shoppingcart.domain.abstraction.personnel;

import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.template.inventory.ProductCatalog;
import com.januelyee.shoppingcart.domain.template.personnel.ProductCatalogManager;
import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;
import com.januelyee.shoppingcart.domain.exceptions.RecordNotFoundException;
import com.januelyee.shoppingcart.domain.exceptions.ShoppingException;
import org.apache.commons.collections4.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractProductCatalogManager implements ProductCatalogManager {

    private ProductCatalog productCatalog;

    @Override
    public ProductCatalog getProductCatalog() {
        return productCatalog;
    }

    @Override
    public void setProductCatalog(ProductCatalog productCatalog) {
        this.productCatalog = productCatalog;
    }

    @Override
    public void addProduct(Product product) {
        checkInput(product);
        try {
            getProductByProductNumber(product.getProductNumber());
            throw new InvalidInputException("This product number already exists!");

        } catch (RecordNotFoundException e) {
            getProductCatalog().create(product);
        }

    }

    @Override
    public void updateProduct(Product product) {
        checkInput(product);
        getProductCatalog().update(product);
    }

    @Override
    public void removeProductFromCatalog(String catalogNumber) {
        checkState();

        List<String> catalogNumbers = new ArrayList<>();
        catalogNumbers.add(catalogNumber);
        List<Product> products = getProductCatalog().findByProductNumbers(catalogNumbers);
        if (products.size() > 1) {
            throw new ShoppingException("There are more than one products that contain the same item code, cannot delete more than one product, " +
                    "please cleanup data!");
        }

        if (!CollectionUtils.isEmpty(products)) {
            Product product = products.get(0);
            getProductCatalog().delete(product);
        }
    }

    @Override
    public Product getProductByProductNumber(String productNumber) {
        checkState();

        List<String> productNumbers = new ArrayList<>();
        productNumbers.add(productNumber);
        List<Product> products = getProductCatalog().findByProductNumbers(productNumbers);
        if (products.size() > 1) {
            throw new ShoppingException("There are more than one products that contain the same item code, cannot return more than one product, " +
                    "please cleanup data!");
        }

        if (!CollectionUtils.isEmpty(products)) {
            return products.get(0);
        }

        throw new RecordNotFoundException("No product was found with product number [" + productNumber + "]");
    }

    @Override
    public List<Product> getProducts() {
        return getProductCatalog().findAll();
    }

    @Override
    public List<Product> getProductsWithFollowingAttributes(List<ProductAttribute> attributes) {
        throw new UnsupportedOperationException("Method is not implemented yet!");
    }

    private void checkInput(Product product) {
        if (product == null) {
            throw new InvalidInputException("Product is not defined!");
        }

        if (product.getName() == null) {
            throw new InvalidInputException("Product name is not defined!");
        }

        if (product.getPrice() < 0) {
            throw new InvalidInputException("Product price is not valid!");
        }

        if (product.getProductNumber() == null || product.getProductNumber().equals("")) {
            throw new InvalidInputException("Product number is not valid!");
        }
    }

    private void checkState() {
        if (getProductCatalog() == null) {
            throw new IllegalStateException("ProductCatalogManager state is not setup properly!");
        }
    }
}
