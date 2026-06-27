import { z } from "zod";
import { Form, FormField } from "@/shared/components/react-hook-form";

import { Button } from "@/shared/components/ui/Button";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
  email: z.string().email("Invalid email address"),
  bio: z
    .string()
    .max(100, "Bio must be at most 100 characters")
    .regex(/^[^<>]*$/, "Bio cannot contain HTML tag characters (< or >)")
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function SettingsPage() {
  const handleSubmit = (values: ProfileFormValues) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <div className="page settings-page">
      <h1>Settings</h1>
      <p className="page-description">Manage your account and application preferences.</p>

      <section className="settings-section">
        <h2>Profile Settings</h2>

        <Form<ProfileFormValues>
          onSubmit={handleSubmit}
          schema={profileSchema}
          options={{
            defaultValues: {
              username: "titan_user",
              email: "user@titan.com",
              bio: "Coding React of Titan!",
            },
          }}
        >
          {({ formState: { isSubmitting } }) => (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}
            >
              <FormField name="username" label="Username" placeholder="Enter your username" />

              <FormField
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
              />

              <FormField
                name="bio"
                label="Biography (Optional)"
                placeholder="Tell us about yourself"
              />

              <div style={{ marginTop: "0.5rem" }}>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Save changes" : "Save changes"}
                </Button>
              </div>
            </div>
          )}
        </Form>
      </section>
    </div>
  );
}

export default SettingsPage;
