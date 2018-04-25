package com.januelyee.shoppingcart.domain.abstraction.personnel;

import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryStorage;
import com.januelyee.shoppingcart.domain.template.personnel.InventoryManager;
import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;
import com.januelyee.shoppingcart.domain.exceptions.RecordNotFoundException;
import com.januelyee.shoppingcart.domain.exceptions.ShoppingException;
import org.apache.commons.collections4.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractInventoryManager implements InventoryManager {

    private InventoryStorage storage;

    @Override
    public void setInventoryStorage(InventoryStorage storage) {
        this.storage = storage;
    }

    @Override
    public InventoryStorage getInventoryStorage() {
        return storage;
    }

    @Override
    public int addItem(InventoryItem item) {
        checkStorageState();
        checkInput(item);

        getInventoryStorage().create(item);
        return item.getQuantity();
    }

    @Override
    public int increaseItemQuantity(String itemCode, int additionalQuantity) {
        checkStorageState();

        List<String> itemCodes = new ArrayList<>();
        itemCodes.add(itemCode);
        List<InventoryItem> items = getInventoryStorage().findByItemCodes(itemCodes);
        if (items.size() > 1) {
            throw new ShoppingException("There are more than one inventory items that contains the same item code, cannot increase quantity, " +
                    "please cleanup data!");
        }

        if (!CollectionUtils.isEmpty(items)) {
            InventoryItem item = items.get(0);
            item.increaseQuantity(additionalQuantity);
            getInventoryStorage().update(item);
            return item.getQuantity();
        }

        throw new RecordNotFoundException("Cannot increase quantity, no inventory item with item code [" + itemCode + "] was found!");
    }

    @Override
    public int decreaseItemQuantity(String itemCode, int reductionQuantity) {
        checkStorageState();

        List<String> itemCodes = new ArrayList<>();
        itemCodes.add(itemCode);
        List<InventoryItem> items = getInventoryStorage().findByItemCodes(itemCodes);
        if (items.size() > 1) {
            throw new ShoppingException("There are more than one inventory items that contains the same item code, cannot decrease quantity, " +
                    "please cleanup data!");
        }

        if (!CollectionUtils.isEmpty(items)) {
            InventoryItem item = items.get(0);
            item.decreaseQuantity(reductionQuantity);
            if (item.getQuantity() > 0) {
                item.setQuantity(0);
            }
            getInventoryStorage().update(item);
            return item.getQuantity();
        }

        throw new RecordNotFoundException("Cannot decrease quantity, no inventory item with item code [" + itemCode + "] was found!");
    }

    @Override
    public int checkItemQuantity(String itemCode) {
        checkStorageState();

        List<String> itemCodes = new ArrayList<>();
        itemCodes.add(itemCode);
        List<InventoryItem> items = getInventoryStorage().findByItemCodes(itemCodes);
        if (items.size() > 1) {
            throw new ShoppingException("There are more than one inventory items that contains the same item code, cannot check quantity, " +
                    "please cleanup data!");
        }

        if (!CollectionUtils.isEmpty(items)) {
            InventoryItem item = items.get(0);
            return item.getQuantity();
        }

        return 0;

    }


    @Override
    public InventoryItem getItem(String itemCode) {
        checkStorageState();

        List<String> itemCodes = new ArrayList<>();
        itemCodes.add(itemCode);
        List<InventoryItem> items = getInventoryStorage().findByItemCodes(itemCodes);
        if (items.size() > 1) {
            throw new ShoppingException("There are more than one inventory items that contains the same item code, cannot return more than one item, " +
                    "please cleanup data!");
        }

        if (!CollectionUtils.isEmpty(items)) {
            return items.get(0);
        }

        throw new RecordNotFoundException("There was no inventory item found with item code [" + itemCode + "]");
    }

    @Override
    public List<InventoryItem> getItems() {
        checkStorageState();
        return getInventoryStorage().findAll();
    }

    @Override
    public void removeItem(String itemCode) {
        checkStorageState();

        List<String> itemCodes = new ArrayList<>();
        itemCodes.add(itemCode);
        List<InventoryItem> items = getInventoryStorage().findByItemCodes(itemCodes);
        getInventoryStorage().deleteAll(items);
    }

    @Override
    public void updateItem(InventoryItem item) {
        checkStorageState();
        checkInput(item);
        getInventoryStorage().update(item);
    }

    private void checkInput(InventoryItem item) {
        if (item == null || item.getItemCode() == null || item.getProduct() == null) {
            throw new InvalidInputException("Inventory item is invalid!");
        }
    }

    private void checkStorageState() {
        if (getInventoryStorage() == null) {
            throw new IllegalStateException("InventoryStorage is not initialized!");
        }
    }
}
