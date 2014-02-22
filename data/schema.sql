drop table if exists loans;
drop table if exists people;
drop sequence if exists serial;

create sequence serial;

create table people (
  person_id integer primary key default nextval('serial'),
  dob date,
  education_status varchar,
  education_degree varchar,
  college varchar,
  major varchar,
  employment_status varchar,
  adjusted_gross_income numeric,
  joint_federal_income_tax boolean,
  spouse_adjusted_gross_income numeric,
  employer_type varchar,
  profession varchar,
  family_size numeric,
  state_residency varchar,
  credit_score varchar, /* we should categorize these */
  situation varchar
);

create table loans (
  loan_id integer primary key default nextval('serial'),
  person_id integer, /* references people, */
  created_at date,
  original_principal numeric,
  current_principal numeric,
  rate numeric,
  disbursement_date date,
  monthly_interest numeric,
  monthly_payment numeric,
  name varchar,
  status varchar,
  servicer varchar,
  type varchar
);

