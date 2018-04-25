package com.januelyee.shoppingcart.services.ejb.implementations.personnel;

import com.januelyee.shoppingcart.daos.ejb.interfaces.ProductCatalogLocal;
import com.januelyee.shoppingcart.domain.abstraction.personnel.AbstractProductCatalogManager;
import com.januelyee.shoppingcart.services.ejb.interfaces.ProductCatalogManagerLocal;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateless;

@Stateless
public class ProductCatalogManagerImpl extends AbstractProductCatalogManager implements ProductCatalogManagerLocal {

    @EJB(beanName = "ProductCatalogJPAImpl")
    private ProductCatalogLocal productCatalogLocal;

    @PostConstruct
    private void injectSuperclassDependencies() {
        super.setProductCatalog(productCatalogLocal);
    }
}
