package com.januelyee.shoppingcart.daos.ejb.jpa;

import com.januelyee.shoppingcart.daos.ejb.exceptions.DAOInvalidInputException;
import com.januelyee.shoppingcart.daos.ejb.exceptions.DAORecordNotFoundException;
import com.januelyee.shoppingcart.daos.ejb.exceptions.DAOShoppingException;
import com.januelyee.shoppingcart.daos.ejb.interfaces.ProductCatalogLocal;
import com.januelyee.shoppingcart.daos.ejb.interfaces.ProductFactoryLocal;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.exceptions.ShoppingException;
import com.januelyee.shoppingcart.entities.ProductEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Stateless(mappedName = "ProductCatalogJPAImpl")
public class ProductCatalogJPAImpl extends AbstractProductCatalogJPAImpl implements ProductCatalogLocal {

    private static final Logger log = LoggerFactory.getLogger(ProductCatalogJPAImpl.class);

    @EJB(beanName = "ProductFactoryJPAImpl")
    private ProductFactoryLocal productFactoryLocal;

    @PostConstruct
    private void injectSuperclassDependencies() {
        super.setStorageFactory(productFactoryLocal);
    }

    @Override
    protected Class getEntityClass() {
        return ProductEntity.class;
    }

    @Override
    protected Long getShoppingEntityId(Product product) {
        if (product instanceof ProductEntity) {
            ProductEntity entity = (ProductEntity) product;
            return entity.getId();
        }

        return null;
    }

    @Override
    protected void setShoppingEntityId(Long id, Product product) {
        if (product instanceof ProductEntity) {
            ((ProductEntity) product).setId(id);
        } else {
            throw new ClassCastException("The given object is not an ProductEntity object!");
        }
    }

    @Override
    protected void checkForInputErrors(Product product) {
        if (product == null) {
            throw new DAOInvalidInputException("Product is not defined!");
        }

        if (product.getProductNumber() == null || product.getProductNumber().equals("")) {
            throw new DAOInvalidInputException("The object to update does not have a product number!");
        }

        if (product.getName() == null || product.getName().equals("")) {
            throw new DAOInvalidInputException("Product name is not defined!");
        }

        if (product.getPrice() < 0) {
            throw new DAOInvalidInputException("Product pricing is invalid");
        }
    }

    @Override
    public List<Product> findByProductNumbers(Collection<String> productNumbers) {
        log.debug("Finding all entities of:[" + getEntityClass() + "]");
        try {
            getEntityManager().clear();
            Query query = getEntityManager().createNamedQuery("ProductEntity.findByProductNumber");
            query.setParameter("productNumbers", productNumbers);
            List<Product> products = (List<Product>) query.getResultList();
            log.debug("Found products: " + products);

            log.debug("Found " + products);
            return products;

        } catch (Exception e) {
            String errorString = "A system error has occurred finding entities of:[" + getEntityClass() + "] with item codes [" + productNumbers + "]";
            log.error(errorString, e);
            throw new ShoppingException(errorString, e);
        }
    }

    @Override
    public void update(Product t) throws DAOInvalidInputException, DAOShoppingException {
        checkForInputErrors(t);

        List<String> productNumbers = new ArrayList<>();
        productNumbers.add(t.getProductNumber());
        List<Product> foundProducts = findByProductNumbers(productNumbers);

        if (foundProducts.size() > 1) {
            throw new ShoppingException("There are more than one products that contain the same item code, cannot update more than one product, " +
                    "please cleanup data!");
        }

        try {

            if (!foundProducts.isEmpty()) {
                Product found = foundProducts.get(0);
                Long id = getShoppingEntityId(found);
                setShoppingEntityId(id, t);


                getEntityManager().merge(t);
            }

        } catch (DAORecordNotFoundException e) {
            log.debug("Entity does not exist in the database, nothing to update here...");

        } catch (Exception e) {
            log.error("A system error has occurred updating the " + getEntityClass().getSimpleName() + "[" + t + "]", e);
            throw new DAOShoppingException("A system error has occurred updating the " + getEntityClass().getSimpleName() + "[" + t + "]", e);

        }
    }
}
