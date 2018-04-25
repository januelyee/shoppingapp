package com.januelyee.shoppingcart.services.ejb.implementations;

import com.januelyee.shoppingcart.domain.abstraction.AbstractProductAdminService;
import com.januelyee.shoppingcart.services.ejb.interfaces.ProductAdminServiceLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.ProductCatalogManagerLocal;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateless;

@Stateless
public class ProductAdminServiceImpl extends AbstractProductAdminService implements ProductAdminServiceLocal {

    @EJB
    private ProductCatalogManagerLocal productCatalogManagerLocal;

    @PostConstruct
    private void injectSuperclassDependencies() {
        super.setProductCatalogManager(productCatalogManagerLocal);
    }
}
