package com.januelyee.shoppingcart.services.ejb.implementations.customer;

import com.januelyee.shoppingcart.domain.abstraction.customer.AbstractCart;
import com.januelyee.shoppingcart.domain.template.customer.CartItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.entities.InventoryItemEntity;
import com.januelyee.shoppingcart.services.ejb.interfaces.CartLocal;

import javax.ejb.Stateful;
import java.util.ArrayList;
import java.util.List;

@Stateful
public class CartImpl extends AbstractCart implements CartLocal {
    @Override
    public List<CartItem> getCartItemsCopy() {
        List<CartItem> cartItems = getCartItems();
        List<CartItem> cartItemsCopy = new ArrayList<>();

        if (cartItems != null) {
            for (CartItem item : cartItems) {
                CartItem c = copyCartItem(item);
                cartItemsCopy.add(c);

            }
        }

        return cartItemsCopy;
    }

    private CartItem copyCartItem(CartItem item) {
        CartItem c = new CartItemImpl();
        c.setStatus(item.getStatus());
        c.setQuantity(item.getQuantity());
        c.setInventoryItem(c.getInventoryItem());

        return c;
    }

    private InventoryItem copyInventoryItem(InventoryItem item) {
        InventoryItem i = new InventoryItemImpl();
        i.setItemCode(item.getItemCode());
        i.setQuantity(item.getQuantity());
        i.setProduct(copyProduct(item.getProduct()));

        return i;
    }


    private Product copyProduct(Product product) {
        Product p = new ProductImpl();
        p.setName(product.getName());
        p.setProductNumber(product.getProductNumber());

        List<ProductAttribute> productAttributes = product.getProductAttributes();
        if (productAttributes != null) {
            for (ProductAttribute attribute : productAttributes) {
                ProductAttribute a = copyProductAttributes(attribute);
                productAttributes.add(a);
            }
        }

        p.setProductAttributes(productAttributes);
        return p;
    }


    private ProductAttribute copyProductAttributes(ProductAttribute attribute) {
        ProductAttribute a = new ProductAttributeImpl();
        a.setName(attribute.getName());
        a.setValue(attribute.getValue());
        a.setSequenceNumber(attribute.getSequenceNumber());
        return a;
    }
}
