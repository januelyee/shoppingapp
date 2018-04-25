package com.januelyee.shoppingcart.entities;

import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractProduct;

import javax.persistence.*;
import java.util.List;

/**
 * JPA entity version of Product.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 04/21/2018
 * @since 1.0
 */
@Entity
@NamedQueries( {
        @NamedQuery(name = "ProductEntity.findAll", query = "SELECT p FROM ProductEntity p"),
        @NamedQuery(name = "ProductEntity.findByProductNumber", query = "SELECT p FROM ProductEntity p WHERE p.productNumber IN :productNumbers")
})
@Table(name = "Product")
public class ProductEntity extends AbstractProduct implements ShoppingEntity, Product {

    private static final long serialVersionUID = -6089666548986037157L;

    private Long id;

    public ProductEntity() {

    }

    public ProductEntity(Product product) {
        if (product instanceof ProductEntity) {
            Long pId = ((ProductEntity) product).getId();
            setId(pId);
        }

        setName(product.getName());
        setPrice(product.getPrice());
        setProductAttributes(product.getProductAttributes());
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

    @Override
    @OneToMany(
            targetEntity = ProductAttributeEntity.class,
            fetch = FetchType.LAZY,
            cascade = {CascadeType.ALL},
            orphanRemoval = true
    )
    @JoinColumn(name="product_id")
    public List<ProductAttribute> getProductAttributes() {
        return super.getProductAttributes();
    }

    @Override
    public ProductAttribute createProductAttributeInstance() {
        return new ProductAttributeEntity();
    }
}
