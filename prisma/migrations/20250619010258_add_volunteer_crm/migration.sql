-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "preferredName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneType" TEXT,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zip" VARCHAR(10) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "occupation" TEXT,
    "employer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skills" TEXT[],
    "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
    "hasVehicle" BOOLEAN NOT NULL DEFAULT false,
    "canHost" BOOLEAN NOT NULL DEFAULT false,
    "availability" JSONB,
    "preferredTasks" TEXT[],
    "maxHoursPerWeek" INTEGER,
    "backgroundCheckStatus" TEXT,
    "backgroundCheckDate" TIMESTAMP(3),
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelation" TEXT,
    "notes" TEXT,
    "flags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerShift" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "eventId" TEXT,
    "role" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL,
    "checkedIn" TIMESTAMP(3),
    "checkedOut" TIMESTAMP(3),
    "hoursWorked" DECIMAL(4,2),
    "tasksCompleted" INTEGER,
    "performance" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerActivity" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "duration" INTEGER,
    "eventId" TEXT,
    "teamId" TEXT,
    "location" TEXT,
    "results" JSONB,

    CONSTRAINT "VolunteerActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "setupTime" TIMESTAMP(3),
    "locationName" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zip" VARCHAR(10) NOT NULL,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "virtualLink" TEXT,
    "virtualInstructions" TEXT,
    "capacity" INTEGER,
    "minVolunteers" INTEGER,
    "maxVolunteers" INTEGER,
    "skillsRequired" TEXT[],
    "trainingRequired" BOOLEAN NOT NULL DEFAULT false,
    "minimumAge" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "goals" JSONB,
    "hostId" TEXT NOT NULL,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVolunteer" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rsvpDate" TIMESTAMP(3),
    "attendedDate" TIMESTAMP(3),
    "role" TEXT,
    "team" TEXT,
    "checkedIn" TIMESTAMP(3),
    "checkedOut" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventVolunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerTeam" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT NOT NULL,
    "deputyId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "weeklyGoals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvassAssignment" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "walkListId" TEXT NOT NULL,
    "precinct" TEXT NOT NULL,
    "streets" TEXT[],
    "houseNumbers" JSONB NOT NULL,
    "estimatedDoors" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "doorsKnocked" INTEGER NOT NULL DEFAULT 0,
    "contactsMade" INTEGER NOT NULL DEFAULT 0,
    "notHome" INTEGER NOT NULL DEFAULT 0,
    "refused" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DECIMAL(5,2),
    "contactRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvassAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneBankSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "scriptId" TEXT,
    "script" TEXT NOT NULL,
    "voterListId" TEXT,
    "totalNumbers" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneBankSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneBankContact" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "voterId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "voterName" TEXT,
    "callTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "result" TEXT NOT NULL,
    "supportLevel" TEXT,
    "issuesDiscussed" TEXT[],
    "voteByMail" BOOLEAN,
    "volunteerInterest" BOOLEAN,
    "notes" TEXT,

    CONSTRAINT "PhoneBankContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerCommunication" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientIds" TEXT[],
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "clicked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "VolunteerCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerTraining" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3) NOT NULL,
    "expiresDate" TIMESTAMP(3),
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "certifiedById" TEXT,
    "score" DECIMAL(5,2),

    CONSTRAINT "VolunteerTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMaterial" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "ordered" BOOLEAN NOT NULL DEFAULT false,
    "received" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EventMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TeamMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Volunteer_campaignId_status_idx" ON "Volunteer"("campaignId", "status");

-- CreateIndex
CREATE INDEX "Volunteer_campaignId_city_idx" ON "Volunteer"("campaignId", "city");

-- CreateIndex
CREATE INDEX "Volunteer_lastName_firstName_idx" ON "Volunteer"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_campaignId_email_key" ON "Volunteer"("campaignId", "email");

-- CreateIndex
CREATE INDEX "VolunteerShift_volunteerId_date_idx" ON "VolunteerShift"("volunteerId", "date");

-- CreateIndex
CREATE INDEX "VolunteerShift_eventId_date_idx" ON "VolunteerShift"("eventId", "date");

-- CreateIndex
CREATE INDEX "VolunteerShift_date_status_idx" ON "VolunteerShift"("date", "status");

-- CreateIndex
CREATE INDEX "VolunteerActivity_volunteerId_date_idx" ON "VolunteerActivity"("volunteerId", "date");

-- CreateIndex
CREATE INDEX "VolunteerActivity_campaignId_type_date_idx" ON "VolunteerActivity"("campaignId", "type", "date");

-- CreateIndex
CREATE INDEX "Event_campaignId_date_idx" ON "Event"("campaignId", "date");

-- CreateIndex
CREATE INDEX "Event_campaignId_type_idx" ON "Event"("campaignId", "type");

-- CreateIndex
CREATE INDEX "Event_date_status_idx" ON "Event"("date", "status");

-- CreateIndex
CREATE INDEX "EventVolunteer_eventId_status_idx" ON "EventVolunteer"("eventId", "status");

-- CreateIndex
CREATE INDEX "EventVolunteer_volunteerId_idx" ON "EventVolunteer"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "EventVolunteer_eventId_volunteerId_key" ON "EventVolunteer"("eventId", "volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerTeam_campaignId_status_idx" ON "VolunteerTeam"("campaignId", "status");

-- CreateIndex
CREATE INDEX "CanvassAssignment_campaignId_date_idx" ON "CanvassAssignment"("campaignId", "date");

-- CreateIndex
CREATE INDEX "CanvassAssignment_volunteerId_date_idx" ON "CanvassAssignment"("volunteerId", "date");

-- CreateIndex
CREATE INDEX "CanvassAssignment_walkListId_idx" ON "CanvassAssignment"("walkListId");

-- CreateIndex
CREATE INDEX "PhoneBankSession_campaignId_date_idx" ON "PhoneBankSession"("campaignId", "date");

-- CreateIndex
CREATE INDEX "PhoneBankContact_sessionId_result_idx" ON "PhoneBankContact"("sessionId", "result");

-- CreateIndex
CREATE INDEX "PhoneBankContact_volunteerId_callTime_idx" ON "PhoneBankContact"("volunteerId", "callTime");

-- CreateIndex
CREATE INDEX "VolunteerCommunication_campaignId_status_idx" ON "VolunteerCommunication"("campaignId", "status");

-- CreateIndex
CREATE INDEX "VolunteerCommunication_scheduledFor_idx" ON "VolunteerCommunication"("scheduledFor");

-- CreateIndex
CREATE INDEX "VolunteerTraining_type_completedDate_idx" ON "VolunteerTraining"("type", "completedDate");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerTraining_volunteerId_type_key" ON "VolunteerTraining"("volunteerId", "type");

-- CreateIndex
CREATE INDEX "EventMaterial_eventId_idx" ON "EventMaterial"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "_TeamMembers_AB_unique" ON "_TeamMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_TeamMembers_B_index" ON "_TeamMembers"("B");

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerShift" ADD CONSTRAINT "VolunteerShift_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerShift" ADD CONSTRAINT "VolunteerShift_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerActivity" ADD CONSTRAINT "VolunteerActivity_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerActivity" ADD CONSTRAINT "VolunteerActivity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerActivity" ADD CONSTRAINT "VolunteerActivity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerActivity" ADD CONSTRAINT "VolunteerActivity_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "VolunteerTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerTeam" ADD CONSTRAINT "VolunteerTeam_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerTeam" ADD CONSTRAINT "VolunteerTeam_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvassAssignment" ADD CONSTRAINT "CanvassAssignment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvassAssignment" ADD CONSTRAINT "CanvassAssignment_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneBankSession" ADD CONSTRAINT "PhoneBankSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneBankContact" ADD CONSTRAINT "PhoneBankContact_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PhoneBankSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneBankContact" ADD CONSTRAINT "PhoneBankContact_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneBankContact" ADD CONSTRAINT "PhoneBankContact_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerCommunication" ADD CONSTRAINT "VolunteerCommunication_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerCommunication" ADD CONSTRAINT "VolunteerCommunication_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerTraining" ADD CONSTRAINT "VolunteerTraining_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerTraining" ADD CONSTRAINT "VolunteerTraining_certifiedById_fkey" FOREIGN KEY ("certifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMaterial" ADD CONSTRAINT "EventMaterial_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamMembers" ADD CONSTRAINT "_TeamMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamMembers" ADD CONSTRAINT "_TeamMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "VolunteerTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
