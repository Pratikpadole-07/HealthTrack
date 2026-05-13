import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ProfilePatient from "./ProfilePatient";
import ProfileDoctor from "./ProfileDoctor";

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return user.role === "doctor" ? <ProfileDoctor /> : <ProfilePatient />;
};

export default Profile;
