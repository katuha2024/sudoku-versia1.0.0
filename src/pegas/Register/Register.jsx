import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { auth } from "../../firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "../login/Login.module.css"; // Використовуємо ті ж стилі, що й для логіну

const Register = () => {
  const navigate = useNavigate();

  const registerSchema = Yup.object().shape({
    email: Yup.string()
      .email("Невірний формат пошти")
      .required("Це поле обов'язкове"),
    password: Yup.string()
      .min(6, "Пароль має бути мін. 6 символів")
      .required("Введіть пароль"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Паролі мають збігатися')
      .required('Підтвердіть пароль'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      alert("Акаунт створено успішно!");
      navigate("/"); // Перенаправляємо на гру після реєстрації
    } catch (error) {
      alert("Помилка реєстрації: " + error.message);
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.authContainer}>
      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "" }}
        validationSchema={registerSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={styles.authForm}>
            <h2 className={styles.title}>REGISTER</h2>
            
            <div className={styles.inputGroup}>
              <Field type="email" name="email" placeholder="Email" className={styles.input} />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>

            <div className={styles.inputGroup}>
              <Field type="password" name="password" placeholder="Password" className={styles.input} />
              <ErrorMessage name="password" component="div" className={styles.error} />
            </div>

            <div className={styles.inputGroup}>
              <Field type="password" name="confirmPassword" placeholder="Confirm Password" className={styles.input} />
              <ErrorMessage name="confirmPassword" component="div" className={styles.error} />
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.loginBtn}>
              {isSubmitting ? "Створення..." : "CREATE ACCOUNT"}
            </button>

            <p className={styles.linkText}>
              Вже є акаунт? <Link to="/login">Увійти</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;