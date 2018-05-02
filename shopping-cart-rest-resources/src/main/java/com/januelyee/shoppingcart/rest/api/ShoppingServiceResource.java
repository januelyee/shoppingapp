package com.januelyee.shoppingcart.rest.api;

import com.januelyee.shoppingcart.domain.template.customer.Cart;
import com.januelyee.shoppingcart.domain.template.customer.CartItem;
import com.januelyee.shoppingcart.domain.template.customer.OrderStatus;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.rest.api.dto.output.CartItemRestOutputDTO;
import com.januelyee.shoppingcart.rest.api.dto.output.CartRestOutputDTO;
import com.januelyee.shoppingcart.rest.api.dto.output.InventoryItemRestOutputDTO;
import com.januelyee.shoppingcart.rest.api.exceptions.RESTInvalidInputException;
import com.januelyee.shoppingcart.services.ejb.interfaces.ShoppingServiceLocal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

@Path("shop")
public class ShoppingServiceResource extends ShoppingResource {

    private static final Logger log = LoggerFactory.getLogger(ShoppingServiceResource.class);

    @EJB
    private ShoppingServiceLocal shoppingServiceLocal;

    @GET
    @Path("cart/{itemCode}/{quantity}")
    public Response addItemToCart(@PathParam("itemCode") String itemCode, @PathParam("quantity") Integer quantity) {
        try {
            if (quantity == null) {
                throw new RESTInvalidInputException("Quantity is not defined!");
            }

            shoppingServiceLocal.addItemToCart(itemCode, quantity.intValue());
            return Response.ok().build();

        } catch (Exception e) {
            log.error("An error occurred adding an item to the cart...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @GET
    @Path("cart")
    public Response getCart() {
        try {
            Cart cart = shoppingServiceLocal.getCartCopy();
            CartRestOutputDTO cartRestOutputDTO = createCartOutputDTO(cart);

            return Response.ok(cartRestOutputDTO).build();
        } catch (Exception e) {
            log.error("An error occurred retrieving the cart...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @PUT
    @Path("cart/return")
    public Response returnCart() {
        try {
            shoppingServiceLocal.returnCart();

            return Response.ok().build();
        } catch (Exception e) {
            log.error("An error occurred returning the cart...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @GET
    @Path("cart/increase/quantity/{itemCode}")
    public Response increaseCartItemQuantity(@PathParam("itemCode") String itemCode) {
        try {
            Integer newQtyInt = shoppingServiceLocal.increaseCartItemQuantity(itemCode, 1);
            return Response.ok(newQtyInt).build();

        } catch (Exception e) {
            log.error("An error occurred increasing cart item amount for item with code [" + itemCode + "]");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }



    @GET
    @Path("cart/decrease/quantity/{itemCode}")
    public Response decreaseCartItemQuantity(@PathParam("itemCode") String itemCode) {
        try {
            Integer newQtyInt = shoppingServiceLocal.decreaseCartItemQuantity(itemCode, 1);
            return Response.ok(newQtyInt).build();

        } catch (Exception e) {
            log.error("An error occurred increasing cart item amount for item with code [" + itemCode + "]");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @PUT
    @Path("order")
    public Response submitOrder() {
        try {
            OrderStatus status = shoppingServiceLocal.submitOrder();
            return Response.ok(status).build();

        } catch (Exception e) {
            log.error("An error occurred while submitting the order...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @GET
    @Path("refresh")
    public Response getUpdatedCartInformation() {
        try {
            Cart cart = shoppingServiceLocal.getUpdatedCartInformation();
            CartRestOutputDTO cartRestOutputDTO = createCartOutputDTO(cart);

            return Response.ok(cartRestOutputDTO).build();

        } catch (Exception e) {
            log.error("An error occurred while submitting the order...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }


    @GET
    @Path("inventory")
    public Response getInventory() {
        try {
            List<InventoryItem> results = shoppingServiceLocal.getInventoryItems();

            List<InventoryItemRestOutputDTO> outputArray = new ArrayList<>();
            for (InventoryItem i : results) {
                outputArray.add(createInventoryItemOutputDTO(i));
            }

            InventoryItemRestOutputDTO[] itemsAsArray = outputArray.toArray(new InventoryItemRestOutputDTO[0]);
            return Response.ok(itemsAsArray).build();

        } catch (Exception e) {
            log.error("An error occurred while submitting the order...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    private CartRestOutputDTO createCartOutputDTO(Cart cart) {
        CartRestOutputDTO dto = new CartRestOutputDTO();
        List<CartItemRestOutputDTO> dtoItems = new ArrayList<>();

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems != null) {
            for (CartItem cartItem : cartItems) {
                CartItemRestOutputDTO cartItemRestOutputDTO = new CartItemRestOutputDTO();
                InventoryItemRestOutputDTO inventoryItemRestOutputDTO = createInventoryItemOutputDTO(cartItem.getInventoryItem());
                cartItemRestOutputDTO.setInventoryItem(inventoryItemRestOutputDTO);
                cartItemRestOutputDTO.setQuantity(cartItem.getQuantity());
                cartItemRestOutputDTO.setStatus(cartItem.getStatus());

                dtoItems.add(cartItemRestOutputDTO);
            }
        }

        dto.setCartItems(dtoItems);

        return dto;
    }


    private InventoryItemRestOutputDTO createInventoryItemOutputDTO(InventoryItem inventoryItem) {
        if (inventoryItem == null) {
            return null;
        }

        InventoryItemRestOutputDTO dto = new InventoryItemRestOutputDTO();
        dto.setItemCode(inventoryItem.getItemCode());
        dto.setQuantity(inventoryItem.getQuantity());
        dto.setProduct(createProductRestOutputDTO(inventoryItem.getProduct()));

        return dto;
    }

}
