package com.refineddata.security.services.ejb.interfaces;

import java.util.Collection;
import java.util.List;

/**
 * <executive summary> - A precise and concise description for the object. Useful to describe groupings of methods and
 * introduce major terms.
 * <p/>
 * <state information> - Specify the state information associated with the object, described in a manner that decouples
 * the states from the operations that may query or change these states. This should also include whether instances of
 * this class are thread safe.
 * (For multi-state objects, a state diagram may be the clearest way to present this information.)
 * If the class allows only single state instances, such as java.lang.Integer, and for interfaces,
 * this section may be skipped.
 * <p/>
 * <os or hardware dependencies> - Specify any reliance on the underlying operating system or hardware.
 * <p/>
 * <allowed implementation variances> - Specify how any aspect of this object that may vary by implementation.
 * This description should not include information about current Java Software implementation bugs.
 * <p/>
 * <security constraints> - If the object has any security constraints or restrictions,
 * an overview of those constraints and restrictions must be provided in the class specification. Documentation for
 * individual security constrained methods must provide detailed information about security constraints.
 * <p/>
 * <serialized form> - This spec ensures that a serialized object can successfully be passed between different
 * implementations of the Java Platform. While public classes that implement serializable are part of the
 * serialized form, note that in some cases it is also necessary to include non-public classes that implement
 * serializable. For more details, see the specific criteria. The serialized form spec defines the
 * <code>readObject</code> and <code>writeObject</code> methods, the fields that are serialized,
 * the data types of those fields, and the order those fields are serialized.
 * <p/>
 * <references to any external specifications> - These are class-level specifications written by Sun or third
 * parties beyond those generated by Javadoc. References are not necessary here if they have been included in
 * the Package specification.
 * <p/>
 * <additional notes> - You may include graphic model diagrams, such as state diagrams, to describe static and dynamic
 * information about objects. Such diagrams may become a requirement in the future.
 * Code examples are useful and illustrative.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/14/2016
 * @since 4.1
 */
public interface SecurityInformationManager<T> {

    T getInformationTemplate();
    void updateInformation(T infoObject);
    void deleteInformation(T infoObject);
    T getLatestInformation(String appId);
    List<T> getAll();
    void deleteAll(Collection<T> infoObjects);
}
