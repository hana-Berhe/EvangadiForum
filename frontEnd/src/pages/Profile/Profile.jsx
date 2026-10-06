import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { getUserProfile, updateUserProfile } from "../../api/profile.api";
import UserAvatar from "../../components/UserAvatar/UserAvatar";
import styles from "./Profile.module.css";
import { API_ORIGIN } from "../../api/config.js";

const emptyForm = (profile = {}) => ({
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  bio: profile.bio ?? "",
});

function getAvatarPreviewUrl(avatar) {
  if (!avatar) return null;
  const origin = API_ORIGIN;

  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("data:")
  ) {
    return avatar;
  }

  if (avatar.startsWith("/")) {
    return `${origin}${avatar}`;
  }

  return `${origin}/${avatar}`;
}

export default function Profile() {
  const { user } = useAuth();
  const { setProfile: setSharedProfile } = useProfile();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      navigate("/auth", { replace: true });
      return;
    }

    let isMounted = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await getUserProfile(user.id);
        const nextProfile = response.data?.data ?? response.data;

        if (!isMounted) return;

        setProfile(nextProfile);
        setSharedProfile(nextProfile);
        setForm(emptyForm(nextProfile));
        setPreviewUrl(getAvatarPreviewUrl(nextProfile?.avatar));
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.msg ||
            "Unable to load your profile right now. Please try again.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setSharedProfile, user]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(getAvatarPreviewUrl(profile?.avatar));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image smaller than 2MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  function startEditing() {
    setError("");
    setForm(emptyForm(profile));
    setPreviewUrl(getAvatarPreviewUrl(profile?.avatar));
    setSelectedFile(null);
    setEditing(true);
  }

  function cancelEditing() {
    setForm(emptyForm(profile));
    setPreviewUrl(getAvatarPreviewUrl(profile?.avatar));
    setSelectedFile(null);
    setEditing(false);
    setError("");
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!user?.id) {
      navigate("/auth", { replace: true });
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = new FormData();
      payload.append("firstName", form.firstName.trim());
      payload.append("lastName", form.lastName.trim());
      payload.append("bio", form.bio.trim());

      if (selectedFile) {
        payload.append("avatar", selectedFile);
      }

      const response = await updateUserProfile(user.id, payload);
      const nextProfile = response.data?.data ?? response.data;

      setSharedProfile(nextProfile);

      setProfile(nextProfile);
      setForm(emptyForm(nextProfile));
      setEditing(false);
      setSelectedFile(null);
      setPreviewUrl(getAvatarPreviewUrl(nextProfile?.avatar));

      if (nextProfile.token) {
        localStorage.setItem("token", nextProfile.token);
      }

      localStorage.setItem("user", JSON.stringify(nextProfile));
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          "Unable to save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className={styles.pageShell}>
        <div className={styles.card}>
          <p className={styles.loadingText}>Loading profile...</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className={styles.pageShell}>
        <div className={styles.card}>
          <p className={styles.errorText}>{error || "Profile not found."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.pageShell}>
      <div className={styles.profileHeaderCard}>
        <div className={styles.headerRow}>
          <div className={styles.avatarBlock}>
            <UserAvatar person={profile} size="large" />
          </div>

          <div className={styles.headerInfo}>
            <p className={styles.eyebrow}>Profile</p>
            <h1>
              {profile.firstName} {profile.lastName}
            </h1>
            <p className={styles.email}>{profile.email}</p>
            <p className={styles.bioText}>{profile.bio || "No bio yet."}</p>
          </div>
        </div>
      </div>

      <div className={styles.infoCard}>
        {!editing ? (
          <>
            <div className={styles.sectionHeader}>
              <h2>Profile information</h2>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={startEditing}
              >
                Edit Profile
              </button>
            </div>

            <div className={styles.infoGrid}>
              <div>
                <span className={styles.label}>First Name</span>
                <strong>{profile.firstName}</strong>
              </div>
              <div>
                <span className={styles.label}>Last Name</span>
                <strong>{profile.lastName}</strong>
              </div>
              <div className={styles.fullWidth}>
                <span className={styles.label}>Email</span>
                <strong>{profile.email}</strong>
              </div>
              <div className={styles.fullWidth}>
                <span className={styles.label}>Bio</span>
                <strong>{profile.bio || "No bio provided."}</strong>
              </div>
            </div>
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.sectionHeader}>
              <h2>Edit profile</h2>
              <div className={styles.inlineActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {error ? <p className={styles.formError}>{error}</p> : null}

            <div className={styles.formGrid}>
              <label>
                <span>First Name</span>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  maxLength={50}
                />
              </label>

              <label>
                <span>Last Name</span>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  maxLength={50}
                />
              </label>

              <label className={styles.fullWidth}>
                <span>Email</span>
                <input type="email" value={profile.email} disabled />
              </label>

              <label className={styles.fullWidth}>
                <span>Bio</span>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell others a little about yourself..."
                />
              </label>
            </div>

            <div className={styles.avatarUploadSection}>
              <label className={styles.avatarLabel}>Profile picture</label>
              <div className={styles.uploadPreviewRow}>
                <div className={styles.previewBox}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile preview" />
                  ) : (
                    <UserAvatar person={profile} size="large" />
                  )}
                </div>

                <div className={styles.uploadMeta}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  <p>JPG, PNG, or WebP • up to 2MB</p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
