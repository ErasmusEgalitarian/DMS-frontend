import React from "react";
import styles from "./styles.module.css";
import Link from "next/link";
import {FaUserFriends} from "react-icons/fa";

const Navbar: React.FC = () => (
  <div className={styles.navbar}>
    <div className={styles.logo}>
      <Link href={"/"}>Cooperativa DMS</Link>
    </div>
    <Link href={"/waste-pickers"} className={styles.item}>
      <FaUserFriends/>
      Waste Pickers
    </Link>
  </div>
);

export default Navbar;