-- Migration 000: Create Base Schema
-- Creates all foundational tables for the Loka property management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable ENUM types
CREATE TYPE immeuble_type AS ENUM ('apartment_block', 'house', 'mixed_use', 'other');
CREATE TYPE logement_statut AS ENUM ('occupe', 'vacant');
CREATE TYPE contrat_statut AS ENUM ('actif', 'termine', 'resilie');
CREATE TYPE paiement_mode AS ENUM ('cash', 'mobile_money', 'virement', 'cheque');
CREATE TYPE alert_type AS ENUM ('missing_payment', 'expiring_contract', 'deposit_to_return');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE garantie_status AS ENUM ('held', 'partial_return', 'returned');

-- Create immeubles table
CREATE TABLE immeubles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proprietaire_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  adresse TEXT,
  ville TEXT,
  type immeuble_type DEFAULT 'apartment_block',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create logements table
CREATE TABLE logements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  immeuble_id UUID NOT NULL REFERENCES immeubles(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  type TEXT,
  description TEXT,
  loyer_mensuel DECIMAL(10, 2) NOT NULL,
  statut logement_statut DEFAULT 'vacant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locataires table
CREATE TABLE locataires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proprietaire_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contrats table
CREATE TABLE contrats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locataire_id UUID NOT NULL REFERENCES locataires(id) ON DELETE CASCADE,
  logement_id UUID NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
  loyer_mensuel DECIMAL(10, 2) NOT NULL,
  depot_garantie DECIMAL(10, 2),
  date_debut DATE NOT NULL,
  date_fin DATE,
  statut contrat_statut DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create paiements table
CREATE TABLE paiements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrat_id UUID NOT NULL REFERENCES contrats(id) ON DELETE CASCADE,
  montant DECIMAL(10, 2) NOT NULL,
  date_paiement DATE NOT NULL,
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  mode paiement_mode DEFAULT 'virement',
  quittance_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE immeubles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logements ENABLE ROW LEVEL SECURITY;
ALTER TABLE locataires ENABLE ROW LEVEL SECURITY;
ALTER TABLE contrats ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for immeubles
CREATE POLICY "Users can view their own immeubles" 
  ON immeubles FOR SELECT 
  USING (auth.uid() = proprietaire_id);

CREATE POLICY "Users can insert their own immeubles" 
  ON immeubles FOR INSERT 
  WITH CHECK (auth.uid() = proprietaire_id);

CREATE POLICY "Users can update their own immeubles" 
  ON immeubles FOR UPDATE 
  USING (auth.uid() = proprietaire_id)
  WITH CHECK (auth.uid() = proprietaire_id);

CREATE POLICY "Users can delete their own immeubles" 
  ON immeubles FOR DELETE 
  USING (auth.uid() = proprietaire_id);

-- Create RLS policies for logements (access through immeuble)
CREATE POLICY "Users can view logements in their immeubles" 
  ON logements FOR SELECT 
  USING (immeuble_id IN (SELECT id FROM immeubles WHERE proprietaire_id = auth.uid()));

CREATE POLICY "Users can insert logements in their immeubles" 
  ON logements FOR INSERT 
  WITH CHECK (immeuble_id IN (SELECT id FROM immeubles WHERE proprietaire_id = auth.uid()));

CREATE POLICY "Users can update logements in their immeubles" 
  ON logements FOR UPDATE 
  USING (immeuble_id IN (SELECT id FROM immeubles WHERE proprietaire_id = auth.uid()))
  WITH CHECK (immeuble_id IN (SELECT id FROM immeubles WHERE proprietaire_id = auth.uid()));

CREATE POLICY "Users can delete logements in their immeubles" 
  ON logements FOR DELETE 
  USING (immeuble_id IN (SELECT id FROM immeubles WHERE proprietaire_id = auth.uid()));

-- Create RLS policies for locataires
CREATE POLICY "Users can view their own locataires" 
  ON locataires FOR SELECT 
  USING (auth.uid() = proprietaire_id);

CREATE POLICY "Users can insert locataires" 
  ON locataires FOR INSERT 
  WITH CHECK (auth.uid() = proprietaire_id);

CREATE POLICY "Users can update their own locataires" 
  ON locataires FOR UPDATE 
  USING (auth.uid() = proprietaire_id)
  WITH CHECK (auth.uid() = proprietaire_id);

CREATE POLICY "Users can delete their own locataires" 
  ON locataires FOR DELETE 
  USING (auth.uid() = proprietaire_id);

-- Create RLS policies for contrats (complex: access through logement)
CREATE POLICY "Users can view contrats for their logements" 
  ON contrats FOR SELECT 
  USING (logement_id IN (
    SELECT l.id FROM logements l 
    INNER JOIN immeubles i ON l.immeuble_id = i.id 
    WHERE i.proprietaire_id = auth.uid()
  ));

CREATE POLICY "Users can insert contrats for their logements" 
  ON contrats FOR INSERT 
  WITH CHECK (logement_id IN (
    SELECT l.id FROM logements l 
    INNER JOIN immeubles i ON l.immeuble_id = i.id 
    WHERE i.proprietaire_id = auth.uid()
  ));

CREATE POLICY "Users can update contrats for their logements" 
  ON contrats FOR UPDATE 
  USING (logement_id IN (
    SELECT l.id FROM logements l 
    INNER JOIN immeubles i ON l.immeuble_id = i.id 
    WHERE i.proprietaire_id = auth.uid()
  ))
  WITH CHECK (logement_id IN (
    SELECT l.id FROM logements l 
    INNER JOIN immeubles i ON l.immeuble_id = i.id 
    WHERE i.proprietaire_id = auth.uid()
  ));

CREATE POLICY "Users can delete contrats for their logements" 
  ON contrats FOR DELETE 
  USING (logement_id IN (
    SELECT l.id FROM logements l 
    INNER JOIN immeubles i ON l.immeuble_id = i.id 
    WHERE i.proprietaire_id = auth.uid()
  ));

-- Create RLS policies for paiements (complex: access through contrat)
CREATE POLICY "Users can view paiements for their contrats" 
  ON paiements FOR SELECT 
  USING (contrat_id IN (
    SELECT c.id FROM contrats c
    INNER JOIN logements l ON c.logement_id = l.id
    INNER JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.proprietaire_id = auth.uid()
  ));

CREATE POLICY "Users can insert paiements for their contrats" 
  ON paiements FOR INSERT 
  WITH CHECK (contrat_id IN (
    SELECT c.id FROM contrats c
    INNER JOIN logements l ON c.logement_id = l.id
    INNER JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.proprietaire_id = auth.uid()
  ));

CREATE POLICY "Users can update paiements for their contrats" 
  ON paiements FOR UPDATE 
  USING (contrat_id IN (
    SELECT c.id FROM contrats c
    INNER JOIN logements l ON c.logement_id = l.id
    INNER JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.proprietaire_id = auth.uid()
  ))
  WITH CHECK (contrat_id IN (
    SELECT c.id FROM contrats c
    INNER JOIN logements l ON c.logement_id = l.id
    INNER JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.proprietaire_id = auth.uid()
  ));

CREATE POLICY "Users can delete paiements for their contrats" 
  ON paiements FOR DELETE 
  USING (contrat_id IN (
    SELECT c.id FROM contrats c
    INNER JOIN logements l ON c.logement_id = l.id
    INNER JOIN immeubles i ON l.immeuble_id = i.id
    WHERE i.proprietaire_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_immeubles_proprietaire ON immeubles(proprietaire_id);
CREATE INDEX idx_logements_immeuble ON logements(immeuble_id);
CREATE INDEX idx_logements_statut ON logements(statut);
CREATE INDEX idx_locataires_proprietaire ON locataires(proprietaire_id);
CREATE INDEX idx_contrats_locataire ON contrats(locataire_id);
CREATE INDEX idx_contrats_logement ON contrats(logement_id);
CREATE INDEX idx_contrats_statut ON contrats(statut);
CREATE INDEX idx_paiements_contrat ON paiements(contrat_id);
CREATE INDEX idx_paiements_date ON paiements(date_paiement DESC);
