package com.januelyee.shoppingcart.entities;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/20/2016
 * @since 1.0
 */
public class PrePersistenceHelper {
    public static void setRequiredPrePersistData(ShoppingEntity entity) {
        setRequiredCommonData(entity);
    }


    public static void setRequiredPreUpdateData(ShoppingEntity entity) {
        setRequiredCommonData(entity);
    }


    private static void setRequiredCommonData(ShoppingEntity entity) {
        //
    }
}
