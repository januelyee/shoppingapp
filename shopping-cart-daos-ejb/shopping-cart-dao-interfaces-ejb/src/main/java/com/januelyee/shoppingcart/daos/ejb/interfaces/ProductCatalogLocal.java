package com.januelyee.shoppingcart.daos.ejb.interfaces;

import com.januelyee.shoppingcart.domain.template.inventory.ProductCatalog;

import javax.ejb.Local;

/**
 * Local EJB Interface for {@link ProductCatalog}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 04/21/2018
 * @since 1.0
 */
@Local
public interface ProductCatalogLocal extends ProductCatalog {
}
