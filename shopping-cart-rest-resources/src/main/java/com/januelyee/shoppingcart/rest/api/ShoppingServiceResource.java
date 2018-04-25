package com.januelyee.shoppingcart.rest.api;

import com.januelyee.shoppingcart.domain.template.customer.Cart;
import com.januelyee.shoppingcart.domain.template.customer.OrderStatus;
import com.januelyee.shoppingcart.rest.api.dto.output.CartRestOutputDTO;
import com.januelyee.shoppingcart.services.ejb.interfaces.ShoppingServiceLocal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;

@Path("shop")
public class ShoppingServiceResource extends ShoppingResource {

    private static final Logger log = LoggerFactory.getLogger(ShoppingServiceResource.class);

    @EJB
    private ShoppingServiceLocal shoppingServiceLocal;

    @PUT
    @Path("/{itemCode}/{quantity}")
    public Response addItemToCart(@PathParam("itemCode") String itemCode, @PathParam("quantity") Integer quantity) {
        return null;
    }

    @GET
    @Path("cart")
    public Response getCart() {
        try {
            Cart cart = shoppingServiceLocal.getCart();
            CartRestOutputDTO cartRestOutputDTO = new CartRestOutputDTO(cart);

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

    @PUT
    @Path("cart/increase/{itemCode}")
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

    @PUT
    @Path("cart/decrease/{itemCode}")
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
            CartRestOutputDTO cartRestOutputDTO = new CartRestOutputDTO(cart);

            return Response.ok(cartRestOutputDTO).build();

        } catch (Exception e) {
            log.error("An error occurred while submitting the order...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

}
