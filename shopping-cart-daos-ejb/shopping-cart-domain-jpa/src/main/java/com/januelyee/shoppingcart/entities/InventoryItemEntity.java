package com.januelyee.shoppingcart.entities;

import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractInventoryItem;

import javax.persistence.*;

/**
 * JPA entity version of InventoryItem.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 04/21/2018
 * @since 1.0
 */
@Entity
@NamedQueries( {
    @NamedQuery(name = "InventoryItemEntity.findAll", query = "SELECT a FROM InventoryItemEntity a"),
    @NamedQuery(name = "InventoryItemEntity.findByItemCodes", query = "SELECT a FROM InventoryItemEntity a WHERE a.itemCode IN :itemCodes")
})
@Table(name = "InventoryItem")
public class InventoryItemEntity extends AbstractInventoryItem implements ShoppingEntity, InventoryItem {

    private static final long serialVersionUID = 4200083315264453122L;
    private Long id;

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

    @Override
    @OneToOne(
            targetEntity = ProductEntity.class,
            cascade = {CascadeType.REFRESH}
    )
    @JoinColumn(name = "product_id")
    public Product getProduct() {
        return super.getProduct();
    }
}
