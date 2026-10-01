export type ContactTopic = {
  id: string;
  label: string;
  detail: string;
};

export type ContactContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  topics: ContactTopic[];
  updatedAt: string;
};

export type ContactContentInput = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  topics: ContactTopic[];
};
