package com.januelyee.shoppingcart.entities;

import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractProductAttribute;

import javax.persistence.*;

/**
 * JPA entity version of ProductAttribute.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 04/21/2018
 * @since 1.0
 */
@Entity
@Table(name = "ProductAttribute")
public class ProductAttributeEntity extends AbstractProductAttribute implements ShoppingEntity, ProductAttribute {
    private static final long serialVersionUID = -6660560408593146083L;

    private Long id;

    public ProductAttributeEntity() {
    }

    public ProductAttributeEntity(String name, String value) {
        super.setName(name);
        super.setValue(value);
    }

    @Override
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }
}
