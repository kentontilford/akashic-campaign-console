-- CreateTable
CREATE TABLE "Voter" (
    "id" TEXT NOT NULL,
    "stateVoterId" TEXT NOT NULL,
    "countyVoterId" TEXT,
    "precinctId" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "nameSuffix" TEXT,
    "namePrefix" TEXT,
    "phone" TEXT,
    "phoneType" TEXT,
    "email" TEXT,
    "emailDeliverable" BOOLEAN NOT NULL DEFAULT true,
    "resAddress1" TEXT NOT NULL,
    "resAddress2" TEXT,
    "resCity" TEXT NOT NULL,
    "resState" VARCHAR(2) NOT NULL,
    "resZip" VARCHAR(10) NOT NULL,
    "resCounty" TEXT,
    "resLatitude" DECIMAL(10,8),
    "resLongitude" DECIMAL(11,8),
    "mailAddress1" TEXT,
    "mailAddress2" TEXT,
    "mailCity" TEXT,
    "mailState" VARCHAR(2),
    "mailZip" VARCHAR(10),
    "birthYear" INTEGER,
    "age" INTEGER,
    "gender" VARCHAR(1),
    "registrationDate" TIMESTAMP(3),
    "registrationStatus" TEXT NOT NULL,
    "partyAffiliation" TEXT,
    "congressionalDist" TEXT,
    "stateSenDist" TEXT,
    "stateHouseDist" TEXT,
    "countyCommDist" TEXT,
    "cityCouncilDist" TEXT,
    "schoolDist" TEXT,
    "modeledParty" TEXT,
    "modeledTurnout" INTEGER,
    "modeledSupport" INTEGER,
    "supportLevel" TEXT,
    "volunteerStatus" BOOLEAN NOT NULL DEFAULT false,
    "donorStatus" BOOLEAN NOT NULL DEFAULT false,
    "doNotContact" BOOLEAN NOT NULL DEFAULT false,
    "dataSource" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingHistory" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "electionType" TEXT NOT NULL,
    "electionName" TEXT NOT NULL,
    "votingMethod" TEXT,
    "partyPrimary" TEXT,

    CONSTRAINT "VotingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterContact" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactType" TEXT NOT NULL,
    "contactDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    "supportLevel" TEXT,
    "issuesCareAbout" TEXT[],
    "notes" TEXT,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),

    CONSTRAINT "VoterContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterTag" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "VoterTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterNote" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "VoterNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterImport" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "errorLog" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "VoterImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voter_stateVoterId_key" ON "Voter"("stateVoterId");

-- CreateIndex
CREATE INDEX "Voter_stateVoterId_idx" ON "Voter"("stateVoterId");

-- CreateIndex
CREATE INDEX "Voter_lastName_firstName_idx" ON "Voter"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Voter_resZip_idx" ON "Voter"("resZip");

-- CreateIndex
CREATE INDEX "Voter_partyAffiliation_idx" ON "Voter"("partyAffiliation");

-- CreateIndex
CREATE INDEX "Voter_campaignId_supportLevel_idx" ON "Voter"("campaignId", "supportLevel");

-- CreateIndex
CREATE INDEX "Voter_campaignId_resCity_idx" ON "Voter"("campaignId", "resCity");

-- CreateIndex
CREATE INDEX "VotingHistory_voterId_idx" ON "VotingHistory"("voterId");

-- CreateIndex
CREATE INDEX "VotingHistory_electionDate_idx" ON "VotingHistory"("electionDate");

-- CreateIndex
CREATE UNIQUE INDEX "VotingHistory_voterId_electionDate_key" ON "VotingHistory"("voterId", "electionDate");

-- CreateIndex
CREATE INDEX "VoterContact_voterId_contactDate_idx" ON "VoterContact"("voterId", "contactDate");

-- CreateIndex
CREATE INDEX "VoterContact_campaignId_contactDate_idx" ON "VoterContact"("campaignId", "contactDate");

-- CreateIndex
CREATE INDEX "VoterContact_userId_contactDate_idx" ON "VoterContact"("userId", "contactDate");

-- CreateIndex
CREATE INDEX "VoterTag_tag_idx" ON "VoterTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "VoterTag_voterId_tag_key" ON "VoterTag"("voterId", "tag");

-- CreateIndex
CREATE INDEX "VoterNote_voterId_createdAt_idx" ON "VoterNote"("voterId", "createdAt");

-- CreateIndex
CREATE INDEX "VoterImport_campaignId_createdAt_idx" ON "VoterImport"("campaignId", "createdAt");

-- AddForeignKey
ALTER TABLE "Voter" ADD CONSTRAINT "Voter_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingHistory" ADD CONSTRAINT "VotingHistory_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterContact" ADD CONSTRAINT "VoterContact_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterContact" ADD CONSTRAINT "VoterContact_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterContact" ADD CONSTRAINT "VoterContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterTag" ADD CONSTRAINT "VoterTag_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterTag" ADD CONSTRAINT "VoterTag_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterNote" ADD CONSTRAINT "VoterNote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterNote" ADD CONSTRAINT "VoterNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterImport" ADD CONSTRAINT "VoterImport_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterImport" ADD CONSTRAINT "VoterImport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
