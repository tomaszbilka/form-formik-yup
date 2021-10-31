import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import styles from "./FormFields.module.css";
import * as yup from "yup";
import { Button } from "@mui/material";
import { ShowInfo } from "..";

const validationSchema = yup.object({
  name: yup
    .string()
    .max(50, "Name is to long!")
    .required("This field is required")
    .strict(),
  preparation_time: yup.string().required("This field is required").strict(),
  type: yup.string().ensure().required("This field is required"),
  no_of_slices: yup
    .number()
    .min(0, "Choose between 0-12")
    .max(12, "Choose between 0-12")
    .when("type", {
      is: (value) => value === "pizza",
      then: yup.number().required("This field is required"),
      otherwise: yup.number(),
    }),
  diameter: yup
    .number()
    .min(12, "Choose between 12-45")
    .max(45, "Choose between 12-45")
    .when("type", {
      is: (value) => value === "pizza",
      then: yup.number().required("This field is required"),
      otherwise: yup.number(),
    }),
  spiciness_scale: yup
    .number()
    .max(10, "scale: 0-10")
    .min(0, "scale: 0-10")
    .when("type", {
      is: (value) => value === "soup",
      then: yup.number().required("This field is required"),
      otherwise: yup.number(),
    }),
  slices_of_bread: yup
    .number()
    .min(1, "Choose at leat one")
    .max(20, "To many slices, 20 is max")
    .when("type", {
      is: (value) => value === "sandwich",
      then: yup.number().required("This field is required"),
      otherwise: yup.number(),
    }),
});

const removeUnnecessaryInputs = (input) => {
  const finalOrder = { ...input };
  if (finalOrder.type === "sandwich") {
    delete finalOrder.no_of_slices;
    delete finalOrder.diameter;
    delete finalOrder.spiciness_scale;
    return finalOrder;
  } else if (finalOrder.type === "soup") {
    delete finalOrder.no_of_slices;
    delete finalOrder.diameter;
    delete finalOrder.slices_of_bread;
    return finalOrder;
  } else {
    delete finalOrder.spiciness_scale;
    delete finalOrder.slices_of_bread;
    return finalOrder;
  }
};

const FormField = () => {
  const [whichDish, setWhichDish] = useState("");
  const [whatNeedToEnableBtn, setWhatNeedToEnableBtn] = useState(false);
  const [isSentWithError, setIsSentWithError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfoAfterSent, setShowInfoAfterSent] = useState(false);

  async function sendOrderToServer(data) {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://frosty-wood-6558.getsandbox.com:443/dishes",
        {
          method: "POST",
          body: data,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const info = await response.json();
      console.log(info);
      setIsSentWithError(false);
      setIsLoading(false);
      setShowInfoAfterSent(true);
    } catch (error) {
      setIsSentWithError(true);
      console.log(error);
      setIsLoading(false);
      setShowInfoAfterSent(true);
    }
  }

  const { values, handleSubmit, handleChange, handleBlur, errors, touched } =
    useFormik({
      initialValues: {
        name: "",
        preparation_time: "",
        type: "",
        no_of_slices: "",
        diameter: "",
        spiciness_scale: "",
        slices_of_bread: "",
      },
      validationSchema,
      onSubmit: (values, { resetForm }) => {
        const orderToSend = removeUnnecessaryInputs(values);
        resetForm("initialValues");
        sendOrderToServer(JSON.stringify(orderToSend));
      },
    });

  useEffect(() => {
    if (values.type === "pizza") {
      setWhichDish("pizza");
      setWhatNeedToEnableBtn(
        !values.no_of_slices ||
          !values.diameter ||
          values.no_of_slices > 12 ||
          values.diameter < 12 ||
          values.diameter > 45
      );
    }
    if (values.type === "soup") {
      setWhichDish("soup");
      setWhatNeedToEnableBtn(
        !values.spiciness_scale || values.spiciness_scale > 10
      );
    }
    if (values.type === "sandwich") {
      setWhichDish("sandwich");
      setWhatNeedToEnableBtn(
        !values.slices_of_bread || values.slices_of_bread > 20
      );
    }
  }, [
    values.type,
    values.no_of_slices,
    values.diameter,
    values.spiciness_scale,
    values.slices_of_bread,
  ]);

  const infoMsg = isSentWithError ? "something went wrong!" : "order sent!";

  return (
    <>
      {showInfoAfterSent && (
        <ShowInfo msg={infoMsg} isError={isSentWithError} />
      )}
      <form onSubmit={handleSubmit}>
        <div className={styles.container}>
          <div className={styles.form_group}>
            <label htmlFor='name'>Name:</label>
            <input
              id='name'
              name='name'
              type='name'
              placeholder='name'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
              error={errors?.name}
            />
            {touched.name && errors.name ? (
              <div className={styles.errorMsg}>{errors.name}</div>
            ) : null}
          </div>

          <div className={styles.form_group}>
            <label htmlFor='preparation_time'>Preparation time:</label>
            <input
              id='preparation_time'
              name='preparation_time'
              type='time'
              step='1'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.preparation_time}
            />
            {touched.preparation_time && errors.preparation_time ? (
              <div className={styles.errorMsg}>{errors.preparation_time}</div>
            ) : null}
          </div>

          <div className={styles.form_group}>
            <label htmlFor='type'>Type:</label>
            <select
              id='type'
              name='type'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.type}
              label='Type'
            >
              <option value='' selected disable hidden>
                choose:
              </option>
              <option value='pizza'>Pizza</option>
              <option value='soup'>Soup</option>
              <option value='sandwich'>Sandwich</option>
            </select>
            {touched.type && errors.type ? (
              <div className={styles.errorMsg}>{errors.type}</div>
            ) : null}
          </div>

          {whichDish === "pizza" && (
            <>
              <div className={styles.form_group}>
                <label htmlFor='no_of_slices'>Number of slices:</label>
                <input
                  id='no_of_slices'
                  name='no_of_slices'
                  type='number'
                  min='0'
                  max='12'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.no_of_slices}
                />
                {touched.no_of_slices && errors.no_of_slices ? (
                  <div className={styles.errorMsg}>{errors.no_of_slices}</div>
                ) : null}
              </div>

              <div className={styles.form_group}>
                <label htmlFor='diameter'>Diameter [cm]:</label>
                <input
                  id='diameter'
                  name='diameter'
                  type='number'
                  min='12'
                  max='45'
                  step='1'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.diameter}
                />
                {touched.diameter && errors.diameter ? (
                  <div className={styles.errorMsg}>{errors.diameter}</div>
                ) : null}
              </div>
            </>
          )}

          {whichDish === "soup" && (
            <div className={styles.form_group}>
              <label htmlFor='spiciness_scale'>How spicy:</label>
              <input
                id='spiciness_scale'
                name='spiciness_scale'
                type='number'
                min='1'
                max='10'
                step='1'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.spiciness_scale}
              />
              {touched.spiciness_scale && errors.spiciness_scale ? (
                <div className={styles.errorMsg}>{errors.spiciness_scale}</div>
              ) : null}
            </div>
          )}

          {whichDish === "sandwich" && (
            <div className={styles.form_group}>
              <label htmlFor='slices_of_bread'>How many slices:</label>
              <input
                id='slices_of_bread'
                name='slices_of_bread'
                type='number'
                min='1'
                max='20'
                step='1'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.slices_of_bread}
              />
              {touched.slices_of_bread && errors.slices_of_bread ? (
                <div className={styles.errorMsg}>{errors.slices_of_bread}</div>
              ) : null}
            </div>
          )}

          <Button
            className={styles.button}
            type='submit'
            variant='contained'
            disabled={
              !values.name ||
              !values.preparation_time ||
              !values.type ||
              whatNeedToEnableBtn
            }
          >
            {isLoading ? "sending..." : "Submit"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default FormField;
