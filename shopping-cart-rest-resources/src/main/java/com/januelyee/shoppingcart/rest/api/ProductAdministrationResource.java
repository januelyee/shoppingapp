package com.januelyee.shoppingcart.rest.api;

import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.rest.api.dto.input.ProductAttributeRestInputDTO;
import com.januelyee.shoppingcart.rest.api.dto.input.ProductRestInputDTO;
import com.januelyee.shoppingcart.rest.api.dto.output.ProductAttributeOutputDTO;
import com.januelyee.shoppingcart.rest.api.dto.output.ProductRestOutputDTO;
import com.januelyee.shoppingcart.services.ejb.interfaces.ProductAdminServiceLocal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

@Path("admin/products")
public class ProductAdministrationResource extends ShoppingResource {

    private static final Logger log = LoggerFactory.getLogger(ProductAdministrationResource.class);

    @EJB
    private ProductAdminServiceLocal productAdminServiceLocal;

    @GET
    public Response getProductsFromCatalog() {
        try {
            List<Product> results = productAdminServiceLocal.getProductsFromCatalog();

            List<ProductRestOutputDTO> outputArray = new ArrayList<>();
            for (Product p : results) {
                outputArray.add(convertToOutputDTO(p));
            }

            ProductRestOutputDTO[] itemsAsArray = outputArray.toArray(new ProductRestOutputDTO[0]);
            return Response.ok(itemsAsArray).build();

        } catch (Exception e) {
            log.error("An error occurred retrieving the products from the catalog...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @POST
    public Response addProductToCatalog(ProductRestInputDTO product) {
        try {
            Product p = convertInputToProduct(product);
            productAdminServiceLocal.addProductToCatalog(p);
            return Response.ok().build();

        } catch (Exception e) {
            log.error("An error occurred requesting to add the product to the catalog...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @DELETE
    @Path("{productNumber}")
    public Response removeProductFromCatalog(@PathParam("productNumber") String productNumber) {
        try {
            productAdminServiceLocal.removeProductFromCatalog(productNumber);
            return Response.ok().build();

        } catch (Exception e) {
            log.error("An error occurred requesting to add the product to the catalog...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @PUT
    public Response updateProductFromCatalog(ProductRestInputDTO product) {
        try {
            Product p = convertInputToProduct(product);
            productAdminServiceLocal.updateProductFromCatalog(p);
            return Response.ok().build();

        } catch (Exception e) {
            log.error("An error occurred requesting to update the product in the catalog...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    @GET
    @Path("{productNumber}")
    public Response getProductInformationFromCatalog(String productNumber) {
        try {
            Product p = productAdminServiceLocal.getProductInformationFromCatalog(productNumber);
            return Response.ok(p).build();

        } catch (Exception e) {
            log.error("An error occurred requesting to get the product information for product number/code [" + productNumber + "] from the catalog...");
            log.error(e.getMessage(), e);
            return generateGeneralErrorResponse(e);
        }
    }

    private Product convertInputToProduct(ProductRestInputDTO inputDTO) {
        Product p = productAdminServiceLocal.getProductCatalogManager().getProductCatalog().getStorageFactory().createInstance();
        p.setName(inputDTO.getName());
        p.setPrice(inputDTO.getPrice());
        p.setProductNumber(inputDTO.getProductNumber());

        List<ProductAttributeRestInputDTO> productAttributeRestInputDTOS = inputDTO.getProductAttributes();
        if (productAttributeRestInputDTOS != null) {
            for (ProductAttributeRestInputDTO productAttributeRestInputDTO : productAttributeRestInputDTOS) {
                ProductAttribute pa = p.createProductAttributeInstance();
                pa.setName(productAttributeRestInputDTO.getName());
                pa.setValue(productAttributeRestInputDTO.getValue());
                pa.setSequenceNumber(productAttributeRestInputDTO.getSequenceNumber());
                p.setAttribute(pa);
            }
        }

        return p;
    }

    private ProductRestOutputDTO convertToOutputDTO(Product product) {
        ProductRestOutputDTO dto = new ProductRestOutputDTO();
        dto.setName(product.getName());
        dto.setProductNumber(product.getProductNumber());
        dto.setPrice(product.getPrice());

        List<ProductAttribute> attributes = product.getProductAttributes();
        if (attributes != null) {
            List<ProductAttributeOutputDTO> attributeOutputDTOS = new ArrayList<>();
            for (ProductAttribute attribute : attributes) {
                ProductAttributeOutputDTO a = new ProductAttributeOutputDTO();
                a.setName(attribute.getName());
                a.setValue(attribute.getValue());
                a.setSequenceNumber(attribute.getSequenceNumber());
                attributeOutputDTOS.add(a);
            }

            dto.setProductAttributes(attributeOutputDTOS);
        }

        return dto;
    }

    /*@GET
    @Path("attributes/search")
    public Response getProductsWithFollowingAttributes(List<ProductAttribute> attributes) {
        // List<Product>
    }*/
}
