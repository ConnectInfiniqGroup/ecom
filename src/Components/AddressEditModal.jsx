import React, { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

import Swal from "sweetalert2";
import GlobalButton from "./Button";
import { City, State } from "country-state-city";
import InputField from "./InputField";

const libraries = ["places"];

const AddressEditModal = ({ show, onClose, address, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);

  const googleMapsApiKey = "AIzaSyBe-vto9mzb1t3HJhvEisd_G_VyNG8dUx8";

  console.log("AddressEditModal Rendered");
  console.log("Modal show:", show);
  console.log("Selected address:", address);
  console.log("Google API key exists:", Boolean(googleMapsApiKey));

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries,
  });

  console.log("Google Maps isLoaded:", isLoaded);
  console.log("Google Maps loadError:", loadError);
  console.log("window.google:", window.google);

  const initial = {
    address: address?.address || "",
    state: address?.state || "",
    city: address?.city || address?.suburb || "",
    postcode: address?.postcode || "",
    country: address?.country || "Australia",
    address_type: address?.address_type || "delivery",
  };

  const [formData, setFormData] = useState(initial);

  useEffect(() => {
    console.log("Address/show changed. Resetting form data.");

    setFormData({
      address: address?.address || "",
      state: address?.state || "",
      city: address?.city || address?.suburb || "",
      postcode: address?.postcode || "",
      country: address?.country || "Australia",
      address_type: address?.address_type || "delivery",
    });
  }, [address?.id, show]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    console.log("Input changed:", {
      id,
      value,
    });

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const getAddressComponent = (components, type) => {
    const component = components.find((item) => item.types.includes(type));
    return component ? component.long_name : "";
  };

  const getAddressComponentShort = (components, type) => {
    const component = components.find((item) => item.types.includes(type));
    return component ? component.short_name : "";
  };

  const handlePlaceChanged = () => {
    console.log("place_changed event triggered");

    if (!autocompleteRef.current) {
      console.error("Autocomplete ref is missing");
      return;
    }

    const place = autocompleteRef.current.getPlace();

    console.log("Selected Google place:", place);

    if (!place) {
      console.error("No place returned from Google Autocomplete");
      return;
    }

    if (!place.address_components) {
      console.error("No address_components found in selected place:", place);
      return;
    }

    const components = place.address_components;

    console.log("Address components:", components);

    const streetNumber = getAddressComponent(components, "street_number");
    const route = getAddressComponent(components, "route");

    const suburb =
      getAddressComponent(components, "locality") ||
      getAddressComponent(components, "postal_town") ||
      getAddressComponent(components, "sublocality") ||
      getAddressComponent(components, "sublocality_level_1");

    const postcode = getAddressComponent(components, "postal_code");

    const stateCode = getAddressComponentShort(
      components,
      "administrative_area_level_1"
    );

    const country = getAddressComponent(components, "country");

    const fullAddress =
      streetNumber && route
        ? `${streetNumber} ${route}`
        : place.formatted_address || "";

    const updatedData = {
      address: fullAddress,
      city: suburb,
      postcode: postcode,
      state: stateCode,
      country: country || "Australia",
    };

    console.log("Parsed address data:", updatedData);

    setFormData((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  useEffect(() => {
    console.log("Autocomplete useEffect running");

    console.log("Debug values:", {
      show,
      isLoaded,
      inputRefExists: Boolean(addressInputRef.current),
      googleExists: Boolean(window.google),
      placesExists: Boolean(window.google?.maps?.places),
    });

    if (!show) {
      console.warn("Modal is not open yet. Autocomplete not initialized.");
      return;
    }

    if (!isLoaded) {
      console.warn("Google Maps script is not loaded yet.");
      return;
    }

    if (!window.google) {
      console.error("window.google is missing.");
      return;
    }

    if (!window.google.maps) {
      console.error("window.google.maps is missing.");
      return;
    }

    if (!window.google.maps.places) {
      console.error(
        "Google Places library is missing. Check libraries=['places'] and enable Places API."
      );
      return;
    }

    if (!addressInputRef.current) {
      console.error("Address input ref is missing.");
      return;
    }

    console.log("Initializing Google Autocomplete...");

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        componentRestrictions: { country: "au" },
        fields: ["address_components", "formatted_address", "geometry", "name"],
        types: ["address"],
      }
    );

    autocompleteRef.current.addListener("place_changed", handlePlaceChanged);

    console.log("Google Autocomplete initialized successfully.");
  }, [isLoaded, show]);

  useEffect(() => {
    console.log("Current formData:", formData);
  }, [formData]);

  const saveAddress = async () => {
    console.log("Save button clicked");
    console.log("Form data before save:", formData);

    if (!address?.id) {
      console.error("Address ID is missing. Cannot update address.");
      return;
    }

    if (
      !formData.address ||
      !formData.state ||
      !formData.city ||
      !formData.postcode
    ) {
      console.warn("Missing required fields:", {
        address: formData.address,
        state: formData.state,
        city: formData.city,
        postcode: formData.postcode,
      });

      Swal.fire({
        title: "Missing details",
        text: "Please fill address, state, city, and postcode.",
        icon: "warning",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        address: formData.address,
        suburb: formData.city,
        postcode: formData.postcode,
        state: formData.state,
        address_type: formData.address_type || "delivery",
      };

      console.log("Sending payload to backend:", payload);

      const { data } = await api.put(`/address/${address.id}/edit`, payload);

      console.log("Backend response:", data);

      if (data?.status === 200) {
        Swal.fire({
          title: "Saved!",
          text: "Address updated successfully.",
          icon: "success",
          confirmButtonColor: "#0d6efd",
        });

        onSaved?.(data?.data);
        onClose?.();
      } else {
        throw new Error(data?.message || "Failed to update address");
      }
    } catch (err) {
      console.error("Error updating address:", err);
      console.error("Backend error response:", err.response?.data);

      Swal.fire({
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Could not update address.",
        icon: "error",
        confirmButtonColor: "#0d6efd",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!show) {
    console.log("Modal hidden. Returning null.");
    return null;
  }

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      tabIndex="-1"
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg rounded-0">
        <div className="modal-content rounded-0">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Edit Address</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {loadError && (
              <div className="alert alert-danger rounded-0">
                Google Maps failed to load. Check your API key, billing, Maps
                JavaScript API, and Places API.
              </div>
            )}

            {!isLoaded && !loadError && (
              <div className="alert alert-warning rounded-0">
                Google Maps is loading...
              </div>
            )}

            <div className="row">
              <div className="col-md-12">
                <label className="form-label">Address</label>

                <input
                  ref={addressInputRef}
                  type="text"
                  id="address"
                  name="address"
                  className="form-control rounded-0"
                  placeholder={
                    isLoaded
                      ? "Start typing your address"
                      : "Loading Google Maps..."
                  }
                  value={formData.address}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="row mt-3">
              <input type="hidden" id="country" value={formData.country} />

              <div className="col-md-6">
                <label className="form-label">Select State</label>
                <select
                  className="form-control rounded-0"
                  id="state"
                  value={formData.state}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData((prev) => ({ ...prev, city: "" }));
                  }}
                >
                  <option value="">Select State</option>
                  {State.getStatesOfCountry("AU").map((st) => (
                    <option key={st.isoCode} value={st.isoCode}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Select City</label>
                <select
                  className="form-control rounded-0"
                  id="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!formData.state}
                >
                  <option value="">Select City</option>
                  {formData.state &&
                    City.getCitiesOfState("AU", formData.state).map((ct) => (
                      <option key={ct.name} value={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-md-12 mt-3">
                <InputField
                  label="Zip Code"
                  type="text"
                  id="postcode"
                  placeholder="Enter Zip Code"
                  value={formData.postcode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-12 d-flex justify-content-between gap-2">
                <GlobalButton
                  onClick={saveAddress}
                  className="btn btn-primary rounded-0"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </GlobalButton>

                <button
                  className="btn btn-outline-dark rounded-0"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressEditModal;