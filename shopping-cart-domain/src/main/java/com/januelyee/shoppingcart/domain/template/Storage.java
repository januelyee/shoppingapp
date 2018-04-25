package com.januelyee.shoppingcart.domain.template;


/**
 * Represents anything that can be considered as a storage.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */

public interface Storage<T> extends CRUDOperations<T> {
    StorageFactory<T> getStorageFactory();
    void setStorageFactory(StorageFactory<T> storageFactory);
}
