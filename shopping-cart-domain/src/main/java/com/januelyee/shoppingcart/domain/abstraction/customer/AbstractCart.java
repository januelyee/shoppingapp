package com.januelyee.shoppingcart.domain.abstraction.customer;

import com.januelyee.shoppingcart.domain.template.customer.Cart;
import com.januelyee.shoppingcart.domain.template.customer.CartItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;
import com.januelyee.shoppingcart.domain.exceptions.RecordNotFoundException;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractCart implements Cart {

    private List<CartItem> items;

    @Override
    public int decreaseItemQuantity(String itemCode, int reductionQuantity) {
        if (items != null) {
            CartItem itemToRemove = null;
            for (CartItem item : items) {
                if (item.getInventoryItem() != null) {
                    if (item.getInventoryItem().getItemCode().equals(itemCode)) {
                        item.decreaseQuantity(reductionQuantity);
                        if (item.getQuantity() < 0) {
                            itemToRemove = item;
                            break;
                        }
                        return item.getQuantity();
                    }
                }
            }
            if (itemToRemove != null) {
                items.remove(itemToRemove);
                return 0;
            }
        }

        throw new RecordNotFoundException("Cannot increase quantity, no cart item with item code [" + itemCode + "] was found!");
    }

    @Override
    public int increaseItemQuantity(String itemCode, int additionalQuantity) {
        if (items != null) {
            for (CartItem item : items) {
                if (item.getInventoryItem() != null) {
                    if (item.getInventoryItem().getItemCode().equals(itemCode)) {
                        item.increaseQuantity(additionalQuantity);
                        return item.getQuantity();
                    }
                }
            }
        }

        throw new RecordNotFoundException("Cannot increase quantity, no cart item with item code [" + itemCode + "] was found!");
    }

    @Override
    public List<CartItem> getCartItems() {
        return items;
    }

    @Override
    public void setCartItems(List<CartItem> items) {
        this.items = items;
    }

    @Override
    public int addItem(CartItem item) {
        if (items == null) {
            items = new ArrayList<>();
        }

        if (item == null) {
            throw new InvalidInputException();
        }

        if (item.getInventoryItem() == null) {
            throw new InvalidInputException();
        }

        boolean existsInCart = false;
        int qty = 0;
        for (CartItem cartItem : items) {
            InventoryItem cartInventoryItem = cartItem.getInventoryItem();
            if (cartInventoryItem.getItemCode().equals(item.getInventoryItem().getItemCode())) {
                qty = cartInventoryItem.increaseQuantity(1);
                existsInCart = true;
                break;
            }
        }

        if (!existsInCart) {
            items.add(item);
            qty = item.getQuantity();
        }

        return qty;
    }

    @Override
    public void removeCartItem(String itemCode) {
        if (itemCode != null) {
            CartItem itemToRemove = null;
            for (CartItem cartItem : items) {
                InventoryItem cartInventoryItem = cartItem.getInventoryItem();
                if (cartInventoryItem.getItemCode().equals(itemCode)) {
                    itemToRemove = cartItem;
                    break;
                }
            }

            if (itemToRemove != null) {
                items.remove(itemToRemove);
            }
        }
    }
}
