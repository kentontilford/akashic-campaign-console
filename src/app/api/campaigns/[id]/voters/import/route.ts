import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import Papa from 'papaparse'

// Define the expected CSV fields
const voterRecordSchema = z.object({
  // Required fields
  state_voter_id: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  res_address1: z.string().min(1),
  res_city: z.string().min(1),
  res_state: z.string().length(2),
  res_zip: z.string().min(5),
  registration_status: z.string().min(1),
  
  // Optional fields
  county_voter_id: z.string().optional(),
  precinct_id: z.string().optional(),
  middle_name: z.string().optional(),
  name_suffix: z.string().optional(),
  name_prefix: z.string().optional(),
  
  phone: z.string().optional(),
  phone_type: z.string().optional(),
  email: z.string().email().optional().or(z.string().length(0)),
  
  res_address2: z.string().optional(),
  res_county: z.string().optional(),
  res_latitude: z.string().optional(),
  res_longitude: z.string().optional(),
  
  mail_address1: z.string().optional(),
  mail_address2: z.string().optional(),
  mail_city: z.string().optional(),
  mail_state: z.string().length(2).optional().or(z.string().length(0)),
  mail_zip: z.string().optional(),
  
  birth_year: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().length(1).optional().or(z.string().length(0)),
  
  registration_date: z.string().optional(),
  party_affiliation: z.string().optional(),
  
  congressional_dist: z.string().optional(),
  state_sen_dist: z.string().optional(),
  state_house_dist: z.string().optional(),
  county_comm_dist: z.string().optional(),
  city_council_dist: z.string().optional(),
  school_dist: z.string().optional(),
  
  // Enhanced data
  modeled_party: z.string().optional(),
  modeled_turnout: z.string().optional(),
  modeled_support: z.string().optional(),
  
  data_source: z.string().optional()
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    // Check if user has access to this campaign
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId,
        userId: session.user.id,
        role: { in: ['CAMPAIGN_MANAGER', 'ADMIN', 'FIELD_DIRECTOR'] }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get the form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const dataSource = formData.get('dataSource') as string || 'STATE_FILE'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create import record
    const importRecord = await prisma.voterImport.create({
      data: {
        campaignId,
        fileName: file.name,
        fileSize: file.size,
        recordCount: 0,
        status: 'PROCESSING',
        createdById: session.user.id,
        startedAt: new Date()
      }
    })

    // Read file content
    const text = await file.text()
    
    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, '_')
    })

    if (parseResult.errors.length > 0) {
      await prisma.voterImport.update({
        where: { id: importRecord.id },
        data: {
          status: 'FAILED',
          errorLog: parseResult.errors as any,
          completedAt: new Date()
        }
      })
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: parseResult.errors 
      }, { status: 400 })
    }

    const records = parseResult.data as any[]
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    // Process in batches of 100
    const batchSize = 100
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async (record, index) => {
        try {
          // Validate record
          const validated = voterRecordSchema.parse(record)
          
          // Convert numeric fields
          const voterData = {
            stateVoterId: validated.state_voter_id,
            countyVoterId: validated.county_voter_id || null,
            precinctId: validated.precinct_id || null,
            firstName: validated.first_name,
            middleName: validated.middle_name || null,
            lastName: validated.last_name,
            nameSuffix: validated.name_suffix || null,
            namePrefix: validated.name_prefix || null,
            phone: validated.phone || null,
            phoneType: validated.phone_type || null,
            email: validated.email || null,
            resAddress1: validated.res_address1,
            resAddress2: validated.res_address2 || null,
            resCity: validated.res_city,
            resState: validated.res_state,
            resZip: validated.res_zip,
            resCounty: validated.res_county || null,
            resLatitude: validated.res_latitude ? parseFloat(validated.res_latitude) : null,
            resLongitude: validated.res_longitude ? parseFloat(validated.res_longitude) : null,
            mailAddress1: validated.mail_address1 || null,
            mailAddress2: validated.mail_address2 || null,
            mailCity: validated.mail_city || null,
            mailState: validated.mail_state || null,
            mailZip: validated.mail_zip || null,
            birthYear: validated.birth_year ? parseInt(validated.birth_year) : null,
            age: validated.age ? parseInt(validated.age) : null,
            gender: validated.gender || null,
            registrationDate: validated.registration_date ? new Date(validated.registration_date) : null,
            registrationStatus: validated.registration_status,
            partyAffiliation: validated.party_affiliation || null,
            congressionalDist: validated.congressional_dist || null,
            stateSenDist: validated.state_sen_dist || null,
            stateHouseDist: validated.state_house_dist || null,
            countyCommDist: validated.county_comm_dist || null,
            cityCouncilDist: validated.city_council_dist || null,
            schoolDist: validated.school_dist || null,
            modeledParty: validated.modeled_party || null,
            modeledTurnout: validated.modeled_turnout ? parseInt(validated.modeled_turnout) : null,
            modeledSupport: validated.modeled_support ? parseInt(validated.modeled_support) : null,
            dataSource: validated.data_source || dataSource,
            campaignId
          }
          
          // Upsert voter record
          await prisma.voter.upsert({
            where: { stateVoterId: voterData.stateVoterId },
            update: voterData,
            create: voterData
          })
          
          successCount++
        } catch (error: any) {
          errorCount++
          errors.push({
            row: i + index + 2, // +2 for header and 0-index
            error: error.message,
            data: record
          })
        }
      }))
    }

    // Update import record
    await prisma.voterImport.update({
      where: { id: importRecord.id },
      data: {
        recordCount: records.length,
        successCount,
        errorCount,
        status: 'COMPLETED',
        errorLog: errors.length > 0 ? errors : undefined,
        completedAt: new Date()
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'VOTER_IMPORT',
        description: `Imported ${successCount} voters from ${file.name}`,
        metadata: {
          importId: importRecord.id,
          fileName: file.name,
          successCount,
          errorCount
        }
      }
    })

    return NextResponse.json({
      importId: importRecord.id,
      totalRecords: records.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // Return first 10 errors
    })

  } catch (error: any) {
    console.error('[VOTER_IMPORT]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}