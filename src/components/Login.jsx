import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import styles from '../styles/Login.module.css';
import { api } from "../services/api";
import { toast } from 'react-toastify';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate(); 


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value.trim();
        const password = e.target.password.value.trim();

        try {
            const response = await api.login(username, password);

            if (response.ok) {
                navigate("/main"); 
            } else {
                const data = await response.json();
                alert(data.error || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            toast.error("Error during login:", error);
            alert("An error occurred during login. Please try again.");
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value.trim();
        const password = e.target.password.value.trim();

        try {
            const response = await api.register(username, password);

            if (response.ok) {
                navigate("/main"); 
            } else {
                const data = await response.json();
                alert(data.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            toast.error("Error during registration:", error);
        }
    };

    useEffect(() => {
        document.body.classList.add(styles.body);
        return () => {
            document.body.classList.remove(styles.body);
        };
    }, []);
    

    return (
        <div id={styles.body}>
            <div className={styles.container}>
                <input
                    type="checkbox"
                    id="toggle-checkbox"
                    className={styles.toggleCheckbox}
                    checked={isRegistering}
                    onChange={() => setIsRegistering(!isRegistering)} 
                />
                <div className={styles.formWrapper}>
                    {/* Login Form */}
                    {!isRegistering ? (
                        <div className={styles.loginFormContainer}>
                            <form id="login-form" onSubmit={handleLoginSubmit}>
                                <h2 className={styles.title}>Login</h2>
                                <input className={styles.input} type="text" name="username" placeholder="Username" required />
                                <input className={styles.input} type="password" name="password" placeholder="Password" required />
                                <button type="submit" className={styles.button}>Login</button>
                                <p className={styles.text}>
                                    Dont have an account?
                                    <label htmlFor="toggle-checkbox" className={styles.toggleLabel}>Register</label>
                                </p>
                            </form>
                        </div>
                    ) : (  
                        <div className={styles.registerFormContainer}>
                            <form id="register-form" onSubmit={handleRegisterSubmit}>
                                <h2 className={styles.title}>Register</h2>
                                <input className={styles.input} type="text" name="username" placeholder="Username" required />
                                <input className={styles.input} type="password" name="password" placeholder="Password" required />
                                <button type="submit" className={styles.button}>Register</button>
                                <p className={styles.text}>
                                    Already have an account?
                                    <label htmlFor="toggle-checkbox" className={styles.toggleLabel}>Login</label>
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
