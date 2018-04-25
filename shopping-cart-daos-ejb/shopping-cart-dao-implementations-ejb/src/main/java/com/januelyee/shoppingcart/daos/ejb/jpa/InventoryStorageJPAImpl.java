package com.januelyee.shoppingcart.daos.ejb.jpa;

import com.januelyee.shoppingcart.daos.ejb.exceptions.DAOInvalidInputException;
import com.januelyee.shoppingcart.daos.ejb.interfaces.InventoryItemFactoryLocal;
import com.januelyee.shoppingcart.daos.ejb.interfaces.InventoryStorageLocal;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.exceptions.ShoppingException;
import com.januelyee.shoppingcart.entities.InventoryItemEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import java.util.Collection;
import java.util.List;

@Stateless(mappedName = "InventoryStorageJPAImpl")
public class InventoryStorageJPAImpl extends AbstractInventoryStorageJPAImpl implements InventoryStorageLocal {

    private static final Logger log = LoggerFactory.getLogger(InventoryStorageJPAImpl.class);

    @EJB(beanName = "InventoryItemFactoryJPAImpl")
    private InventoryItemFactoryLocal inventoryItemFactoryLocal;

    @PostConstruct
    private void injectSuperclassDependencies() {
        super.setStorageFactory(inventoryItemFactoryLocal);
    }

    @Override
    protected Class getEntityClass() {
        return InventoryItemEntity.class;
    }

    @Override
    protected Long getShoppingEntityId(InventoryItem inventoryItem) {
        if (inventoryItem instanceof InventoryItemEntity) {
            InventoryItemEntity entity = (InventoryItemEntity) inventoryItem;
            return entity.getId();
        }

        return null;
    }

    @Override
    public List<InventoryItem> findByItemCodes(Collection<String> itemCodes) {
        log.debug("Finding all entities of:[" + getEntityClass() + "]");
        try {
            getEntityManager().clear();
            List<InventoryItem> results = (List<InventoryItem>) getEntityManager().createNamedQuery(getEntityClass().getSimpleName() + ".findByItemCodes").getResultList();

            log.debug("Found " + results);
            return results;

        } catch (Exception e) {
            String errorString = "A system error has occurred finding entities of:[" + getEntityClass() + "] with item codes [" + itemCodes + "]";
            log.error(errorString, e);
            throw new ShoppingException(errorString, e);
        }
    }

    @Override
    protected void checkForInputErrors(InventoryItem inventoryItem) {

        if (inventoryItem == null) {
            throw new DAOInvalidInputException("Inventory item is not defined!");
        }

        if (inventoryItem.getItemCode() == null || inventoryItem.getItemCode().equals("")) {
            throw new DAOInvalidInputException("Inventory item code is not valid!");
        }

        if (inventoryItem.getProduct() == null) {
            throw new DAOInvalidInputException("Inventory item does not have a product associated with it!");
        }
    }

    @Override
    public void update(InventoryItem inventoryItem) {

    }
}
