import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { auth } from "../../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Login.module.css";

const Login = () => {
  const navigate = useNavigate();

  // Схема валідації: перевіряємо, чи пошта схожа на пошту і чи введено пароль
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Невірний формат пошти")
      .required("Це поле обов'язкове"),
    password: Yup.string()
      .min(6, "Пароль має бути мін. 6 символів")
      .required("Введіть пароль"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Спроба увійти через Firebase
      await signInWithEmailAndPassword(auth, values.email, values.password);
      alert("Вхід успішний!");
      navigate("/"); // Повертаємося до гри після входу
    } catch (error) {
      alert("Помилка входу: " + error.message);
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.authContainer}>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={styles.authForm}>
            <h2 className={styles.title}>LOGIN</h2>
            
            <div className={styles.inputGroup}>
              <Field 
                type="email" 
                name="email" 
                placeholder="Email" 
                className={styles.input} 
              />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>

            <div className={styles.inputGroup}>
              <Field 
                type="password" 
                name="password" 
                placeholder="Password" 
                className={styles.input} 
              />
              <ErrorMessage name="password" component="div" className={styles.error} />
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.loginBtn}>
              {isSubmitting ? "Вхід..." : "LOG IN"}
            </button>

            <p className={styles.linkText}>
              Немає акаунту? <Link to="/register">Зареєструватися</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;