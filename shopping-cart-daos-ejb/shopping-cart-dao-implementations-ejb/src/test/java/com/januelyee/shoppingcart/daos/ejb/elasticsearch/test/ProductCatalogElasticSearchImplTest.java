package com.januelyee.shoppingcart.daos.ejb.elasticsearch.test;

public class ProductCatalogElasticSearchImplTest {

    /*private ProductCatalogElasticSearchImpl productCatalogElasticSearch = new ProductCatalogElasticSearchImpl();
    private static final Random random = new Random();

    @Test
    public void testCreate() {
        String productNumber = "TEST" + random.nextInt();

        ProductAttribute productAttribute = new ProductAttributeObject();
        productAttribute.setName("Test");
        productAttribute.setValue("Test Value");

        Product product = new ProductObject();
        product.setName("Test Product");
        product.setProductNumber(productNumber);
        product.setPrice(10.00);
        product.setAttribute(productAttribute);

        productCatalogElasticSearch.create(product);
        List<String> productNumbers = new ArrayList<>();
        productNumbers.add(productNumber);

        List<Product> products = productCatalogElasticSearch.findByProductNumbers(productNumbers);

        Assert.assertEquals(productNumbers.size(), products.size());
    }

    @Test
    public void testUpdate() {
        ProductAttribute productAttribute = new ProductAttributeObject();
        productAttribute.setName("Test Attribute Name Update");
        productAttribute.setValue("Test Value Update");

        Product product = new ProductObject();
        product.setName("Test Product Update");
        product.setProductNumber("TEST255414319");
        product.setPrice(10.00);
        product.setAttribute(productAttribute);

        productCatalogElasticSearch.update(product);
    }

    @Test
    public void testDelete() {
        List<String> productNumbers = new ArrayList<>();
        productNumbers.add("TEST222381674");

        List<Product> products = productCatalogElasticSearch.findByProductNumbers(productNumbers);
        productCatalogElasticSearch.deleteAll(products);
    }*/

}
