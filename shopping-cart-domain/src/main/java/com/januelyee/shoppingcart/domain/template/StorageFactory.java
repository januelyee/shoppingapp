package com.januelyee.shoppingcart.domain.template;

/**
 * A utility interface that aids in instantiating instances of {@link T} implementations.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */

public interface StorageFactory<T> {
    T createInstance();
}
