import { create } from 'xmlbuilder2';

// Definición de interfaces basadas en los esquemas XSD
interface CsCommonData {
  sourceName?: string;
  dTimCreation?: string;
  dTimLastChange?: string;
  itemState?: string;
  serviceCategory?: string;
  comments?: string;
  acquisitionTimeZone?: { dTim: string; offset: string }[];
  defaultDatum?: string;
  privateGroupOnly?: boolean;
  extensionAny?: any;
  extensionNameValue?: {
    name: string;
    value: string;
    dataType: string;
    dTim?: string;
    md?: number;
    index?: number;
    measureClass?: string;
    description?: string;
  }[];
}

interface CsDrillingParams {
  eTimOpBit: string; // Operating time spent by bit for run
  mdHoleStart?: number; // Measured depth at start
  mdHoleStop: number; // Measured depth at stop
  tubular?: string; // Pointer to the tubular assembly
  hkldRot?: number; // Hookload - rotating
  overPull?: number; // hkldUp - hkldRot
  slackOff?: number; // hkldRot - hkldDown
  hkldUp?: number; // Hookload - string moving up
  hkldDn?: number; // Hookload - string moving down
  tqOnBotAv?: number; // Average Torque - on bottom
  tqOnBotMx?: number; // Maximum torque - on bottom
  tqOnBotMn?: number; // Minimum torque - on bottom
  tqOffBotAv?: number; // Average torque - off bottom
  tqDhAv?: number; // Average torque - downhole
  wtAboveJar?: number; // Weight above jars
  wtBelowJar?: number; // Weight below jars
  wtMud?: number; // Mud density
  flowratePump?: number; // Pump flow rate
  powBit?: number; // Bit hydraulic
  velNozzleAv?: number; // Bit nozzle average velocity
  presDropBit?: number; // Pressure drop in bit
  cTimHold?: string; // Time spent on hold from start of bit run
  cTimSteering?: string; // Time spent steering from start of bit run
  cTimDrillRot?: string; // Time spent rotary drilling from start of bit run
  cTimDrillSlid?: string; // Time spent slide drilling from start of bit run
  cTimCirc?: string; // Time spent circulating from start of bit run
  cTimReam?: string; // Time spent reaming from start of bit run
  distDrillRot?: number; // Distance drilled - rotating
  distDrillSlid?: number; // Distance drilled - sliding
  distReam?: number; // Distance reamed
  distHold?: number; // Distance covered while holding angle
  distSteering?: number; // Distance covered while actively steering
  rpmAv?: number; // Average turn rate (commonly in rpm)
  rpmMx?: number; // Maximum turn rate (commonly in rpm)
  rpmMn?: number; // Minimum turn rate (commonly in rpm)
  rpmAvDh?: number; // Average turn rate (commonly in rpm) downhole
  ropAv?: number; // Average rate of penetration
  ropMx?: number; // Maximum rate of penetration
  ropMn?: number; // Minimum rate of penetration
  wobAv?: number; // Surface weight on bit - average
  wobMx?: number; // Weight on bit - maximum
  wobMn?: number; // Weight on bit - minimum
  wobAvDh?: number; // Weight on bit - average downhole
  reasonTrip?: string; // Reason for trip
  objectiveBha?: string; // Objective of bottom hole assembly
  aziTop?: number; // Azimuth at start measured depth
  aziBottom?: number; // Azimuth at stop measured depth
  inclStart?: number; // Inclination at start measured depth
  inclMx?: number; // Maximum inclination
  inclMn?: number; // Minimum inclination
  inclStop?: number; // Inclination at stop measured depth
  tempMudDhMx?: number; // Maximum mud temperature downhole during run
  presPumpAv?: number; // Average pump pressure
  flowrateBit?: number; // Flow rate at bit
  mudClass?: string; // Class of the drilling fluid
  mudSubClass?: string; // Mud subtype at event occurrence
  comments?: string; // Comments and remarks
  extensionNameValue?: {
    name: string;
    value: string;
    dataType: string;
    dTim?: string;
    md?: number;
    index?: number;
    measureClass?: string;
    description?: string;
  }[];
}

interface GrpBhaRun {
  tubular: string; // Foreign key to the tubular assembly
  dTimStart?: string; // Date and time that activities started
  dTimStop?: string; // Date and time that activities stopped
  dTimStartDrilling?: string; // Start on bottom - date and time
  dTimStopDrilling?: string; // Start off bottom - date and time
  planDogleg?: number; // Planned dogleg severity
  actDogleg?: number; // Actual dogleg severity
  actDoglegMx?: number; // Actual dogleg severity - Maximum
  statusBha?: string; // Bottom hole assembly status
  numBitRun?: string; // Bit run number
  numStringRun?: number; // BHA (drilling string) run number
  reasonTrip?: string; // Reason for trip
  objectiveBha?: string; // Objective of bottom hole assembly
  drillingParams?: CsDrillingParams[]; // Drilling parameters
}

interface ObjBhaRun {
  nameWell: string; // Human recognizable context for the well
  nameWellbore: string; // Human recognizable context for the wellbore
  name: string; // Human recognizable context for the run
  bhaRun?: GrpBhaRun; // Non-contextual elements for a bottom hole assembly run
  commonData?: CsCommonData; // Common data elements
  customData?: any; // Custom or user-defined data elements
  uidWell?: string; // Unique identifier for the well
  uidWellbore?: string; // Unique identifier for the wellbore
  uid?: string; // Unique identifier for the run
}

interface ObjBhaRuns {
  documentInfo?: { title: string; author: string; version: string }; // Information about the XML message instance
  bhaRun: ObjBhaRun[]; // A single bottom hole assembly run
  version: string; // Data object schema version
}

// Función para generar el XML de WITSML
function generateWitsmlBhaRuns(bhaRuns: ObjBhaRuns): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('bhaRuns', {
    version: bhaRuns.version,
  });

  if (bhaRuns.documentInfo) {
    root
      .ele('documentInfo')
      .ele('title')
      .txt(bhaRuns.documentInfo.title)
      .up()
      .ele('author')
      .txt(bhaRuns.documentInfo.author)
      .up()
      .ele('version')
      .txt(bhaRuns.documentInfo.version)
      .up();
  }

  bhaRuns.bhaRun.forEach((bhaRun) => {
    const bhaRunElement = root
      .ele('bhaRun')
      .ele('nameWell')
      .txt(bhaRun.nameWell)
      .up()
      .ele('nameWellbore')
      .txt(bhaRun.nameWellbore)
      .up()
      .ele('name')
      .txt(bhaRun.name)
      .up();

    if (bhaRun.bhaRun) {
      const grpBhaRun = bhaRunElement.ele('bhaRun');
      grpBhaRun.ele('tubular').txt(bhaRun.bhaRun.tubular).up();

      if (bhaRun.bhaRun.dTimStart) {
        grpBhaRun.ele('dTimStart').txt(bhaRun.bhaRun.dTimStart).up();
      }
      if (bhaRun.bhaRun.dTimStop) {
        grpBhaRun.ele('dTimStop').txt(bhaRun.bhaRun.dTimStop).up();
      }
      if (bhaRun.bhaRun.dTimStartDrilling) {
        grpBhaRun
          .ele('dTimStartDrilling')
          .txt(bhaRun.bhaRun.dTimStartDrilling)
          .up();
      }
      if (bhaRun.bhaRun.dTimStopDrilling) {
        grpBhaRun
          .ele('dTimStopDrilling')
          .txt(bhaRun.bhaRun.dTimStopDrilling)
          .up();
      }
      if (bhaRun.bhaRun.planDogleg) {
        grpBhaRun
          .ele('planDogleg')
          .txt(bhaRun.bhaRun.planDogleg.toString())
          .up();
      }
      if (bhaRun.bhaRun.actDogleg) {
        grpBhaRun.ele('actDogleg').txt(bhaRun.bhaRun.actDogleg.toString()).up();
      }
      if (bhaRun.bhaRun.actDoglegMx) {
        grpBhaRun
          .ele('actDoglegMx')
          .txt(bhaRun.bhaRun.actDoglegMx.toString())
          .up();
      }
      if (bhaRun.bhaRun.statusBha) {
        grpBhaRun.ele('statusBha').txt(bhaRun.bhaRun.statusBha).up();
      }
      if (bhaRun.bhaRun.numBitRun) {
        grpBhaRun.ele('numBitRun').txt(bhaRun.bhaRun.numBitRun).up();
      }
      if (bhaRun.bhaRun.numStringRun) {
        grpBhaRun
          .ele('numStringRun')
          .txt(bhaRun.bhaRun.numStringRun.toString())
          .up();
      }
      if (bhaRun.bhaRun.reasonTrip) {
        grpBhaRun.ele('reasonTrip').txt(bhaRun.bhaRun.reasonTrip).up();
      }
      if (bhaRun.bhaRun.objectiveBha) {
        grpBhaRun.ele('objectiveBha').txt(bhaRun.bhaRun.objectiveBha).up();
      }
      if (bhaRun.bhaRun.drillingParams) {
        bhaRun.bhaRun.drillingParams.forEach((drillingParam) => {
          const drillingParamElement = grpBhaRun.ele('drillingParams');
          drillingParamElement
            .ele('eTimOpBit')
            .txt(drillingParam.eTimOpBit)
            .up();
          if (drillingParam.mdHoleStart) {
            drillingParamElement
              .ele('mdHoleStart')
              .txt(drillingParam.mdHoleStart.toString())
              .up();
          }
          drillingParamElement
            .ele('mdHoleStop')
            .txt(drillingParam.mdHoleStop.toString())
            .up();
          if (drillingParam.tubular) {
            drillingParamElement.ele('tubular').txt(drillingParam.tubular).up();
          }
          if (drillingParam.hkldRot) {
            drillingParamElement
              .ele('hkldRot')
              .txt(drillingParam.hkldRot.toString())
              .up();
          }
          if (drillingParam.overPull) {
            drillingParamElement
              .ele('overPull')
              .txt(drillingParam.overPull.toString())
              .up();
          }
          if (drillingParam.slackOff) {
            drillingParamElement
              .ele('slackOff')
              .txt(drillingParam.slackOff.toString())
              .up();
          }
          if (drillingParam.hkldUp) {
            drillingParamElement
              .ele('hkldUp')
              .txt(drillingParam.hkldUp.toString())
              .up();
          }
          if (drillingParam.hkldDn) {
            drillingParamElement
              .ele('hkldDn')
              .txt(drillingParam.hkldDn.toString())
              .up();
          }
          if (drillingParam.tqOnBotAv) {
            drillingParamElement
              .ele('tqOnBotAv')
              .txt(drillingParam.tqOnBotAv.toString())
              .up();
          }
          if (drillingParam.tqOnBotMx) {
            drillingParamElement
              .ele('tqOnBotMx')
              .txt(drillingParam.tqOnBotMx.toString())
              .up();
          }
          if (drillingParam.tqOnBotMn) {
            drillingParamElement
              .ele('tqOnBotMn')
              .txt(drillingParam.tqOnBotMn.toString())
              .up();
          }
          if (drillingParam.tqOffBotAv) {
            drillingParamElement
              .ele('tqOffBotAv')
              .txt(drillingParam.tqOffBotAv.toString())
              .up();
          }
          if (drillingParam.tqDhAv) {
            drillingParamElement
              .ele('tqDhAv')
              .txt(drillingParam.tqDhAv.toString())
              .up();
          }
          if (drillingParam.wtAboveJar) {
            drillingParamElement
              .ele('wtAboveJar')
              .txt(drillingParam.wtAboveJar.toString())
              .up();
          }
          if (drillingParam.wtBelowJar) {
            drillingParamElement
              .ele('wtBelowJar')
              .txt(drillingParam.wtBelowJar.toString())
              .up();
          }
          if (drillingParam.wtMud) {
            drillingParamElement
              .ele('wtMud')
              .txt(drillingParam.wtMud.toString())
              .up();
          }
          if (drillingParam.flowratePump) {
            drillingParamElement
              .ele('flowratePump')
              .txt(drillingParam.flowratePump.toString())
              .up();
          }
          if (drillingParam.powBit) {
            drillingParamElement
              .ele('powBit')
              .txt(drillingParam.powBit.toString())
              .up();
          }
          if (drillingParam.velNozzleAv) {
            drillingParamElement
              .ele('velNozzleAv')
              .txt(drillingParam.velNozzleAv.toString())
              .up();
          }
          if (drillingParam.presDropBit) {
            drillingParamElement
              .ele('presDropBit')
              .txt(drillingParam.presDropBit.toString())
              .up();
          }
          if (drillingParam.cTimHold) {
            drillingParamElement
              .ele('cTimHold')
              .txt(drillingParam.cTimHold)
              .up();
          }
          if (drillingParam.cTimSteering) {
            drillingParamElement
              .ele('cTimSteering')
              .txt(drillingParam.cTimSteering)
              .up();
          }
          if (drillingParam.cTimDrillRot) {
            drillingParamElement
              .ele('cTimDrillRot')
              .txt(drillingParam.cTimDrillRot)
              .up();
          }
          if (drillingParam.cTimDrillSlid) {
            drillingParamElement
              .ele('cTimDrillSlid')
              .txt(drillingParam.cTimDrillSlid)
              .up();
          }
          if (drillingParam.cTimCirc) {
            drillingParamElement
              .ele('cTimCirc')
              .txt(drillingParam.cTimCirc)
              .up();
          }
          if (drillingParam.cTimReam) {
            drillingParamElement
              .ele('cTimReam')
              .txt(drillingParam.cTimReam)
              .up();
          }
          if (drillingParam.distDrillRot) {
            drillingParamElement
              .ele('distDrillRot')
              .txt(drillingParam.distDrillRot.toString())
              .up();
          }
          if (drillingParam.distDrillSlid) {
            drillingParamElement
              .ele('distDrillSlid')
              .txt(drillingParam.distDrillSlid.toString())
              .up();
          }
          if (drillingParam.distReam) {
            drillingParamElement
              .ele('distReam')
              .txt(drillingParam.distReam.toString())
              .up();
          }
          if (drillingParam.distHold) {
            drillingParamElement
              .ele('distHold')
              .txt(drillingParam.distHold.toString())
              .up();
          }
          if (drillingParam.distSteering) {
            drillingParamElement
              .ele('distSteering')
              .txt(drillingParam.distSteering.toString())
              .up();
          }
          if (drillingParam.rpmAv) {
            drillingParamElement
              .ele('rpmAv')
              .txt(drillingParam.rpmAv.toString())
              .up();
          }
          if (drillingParam.rpmMx) {
            drillingParamElement
              .ele('rpmMx')
              .txt(drillingParam.rpmMx.toString())
              .up();
          }
          if (drillingParam.rpmMn) {
            drillingParamElement
              .ele('rpmMn')
              .txt(drillingParam.rpmMn.toString())
              .up();
          }
          if (drillingParam.rpmAvDh) {
            drillingParamElement
              .ele('rpmAvDh')
              .txt(drillingParam.rpmAvDh.toString())
              .up();
          }
          if (drillingParam.ropAv) {
            drillingParamElement
              .ele('ropAv')
              .txt(drillingParam.ropAv.toString())
              .up();
          }
          if (drillingParam.ropMx) {
            drillingParamElement
              .ele('ropMx')
              .txt(drillingParam.ropMx.toString())
              .up();
          }
          if (drillingParam.ropMn) {
            drillingParamElement
              .ele('ropMn')
              .txt(drillingParam.ropMn.toString())
              .up();
          }
          if (drillingParam.wobAv) {
            drillingParamElement
              .ele('wobAv')
              .txt(drillingParam.wobAv.toString())
              .up();
          }
          if (drillingParam.wobMx) {
            drillingParamElement
              .ele('wobMx')
              .txt(drillingParam.wobMx.toString())
              .up();
          }
          if (drillingParam.wobMn) {
            drillingParamElement
              .ele('wobMn')
              .txt(drillingParam.wobMn.toString())
              .up();
          }
          if (drillingParam.wobAvDh) {
            drillingParamElement
              .ele('wobAvDh')
              .txt(drillingParam.wobAvDh.toString())
              .up();
          }
          if (drillingParam.reasonTrip) {
            drillingParamElement
              .ele('reasonTrip')
              .txt(drillingParam.reasonTrip)
              .up();
          }
          if (drillingParam.objectiveBha) {
            drillingParamElement
              .ele('objectiveBha')
              .txt(drillingParam.objectiveBha)
              .up();
          }
          if (drillingParam.aziTop) {
            drillingParamElement
              .ele('aziTop')
              .txt(drillingParam.aziTop.toString())
              .up();
          }
          if (drillingParam.aziBottom) {
            drillingParamElement
              .ele('aziBottom')
              .txt(drillingParam.aziBottom.toString())
              .up();
          }
          if (drillingParam.inclStart) {
            drillingParamElement
              .ele('inclStart')
              .txt(drillingParam.inclStart.toString())
              .up();
          }
          if (drillingParam.inclMx) {
            drillingParamElement
              .ele('inclMx')
              .txt(drillingParam.inclMx.toString())
              .up();
          }
          if (drillingParam.inclMn) {
            drillingParamElement
              .ele('inclMn')
              .txt(drillingParam.inclMn.toString())
              .up();
          }
          if (drillingParam.inclStop) {
            drillingParamElement
              .ele('inclStop')
              .txt(drillingParam.inclStop.toString())
              .up();
          }
          if (drillingParam.tempMudDhMx) {
            drillingParamElement
              .ele('tempMudDhMx')
              .txt(drillingParam.tempMudDhMx.toString())
              .up();
          }
          if (drillingParam.presPumpAv) {
            drillingParamElement
              .ele('presPumpAv')
              .txt(drillingParam.presPumpAv.toString())
              .up();
          }
          if (drillingParam.flowrateBit) {
            drillingParamElement
              .ele('flowrateBit')
              .txt(drillingParam.flowrateBit.toString())
              .up();
          }
          if (drillingParam.mudClass) {
            drillingParamElement
              .ele('mudClass')
              .txt(drillingParam.mudClass)
              .up();
          }
          if (drillingParam.mudSubClass) {
            drillingParamElement
              .ele('mudSubClass')
              .txt(drillingParam.mudSubClass)
              .up();
          }
          if (drillingParam.comments) {
            drillingParamElement
              .ele('comments')
              .txt(drillingParam.comments)
              .up();
          }
          if (drillingParam.extensionNameValue) {
            drillingParam.extensionNameValue.forEach((extension) => {
              const extensionElement =
                drillingParamElement.ele('extensionNameValue');
              extensionElement.ele('name').txt(extension.name).up();
              extensionElement.ele('value').txt(extension.value).up();
              extensionElement.ele('dataType').txt(extension.dataType).up();
              if (extension.dTim) {
                extensionElement.ele('dTim').txt(extension.dTim).up();
              }
              if (extension.md) {
                extensionElement.ele('md').txt(extension.md.toString()).up();
              }
              if (extension.index) {
                extensionElement
                  .ele('index')
                  .txt(extension.index.toString())
                  .up();
              }
              if (extension.measureClass) {
                extensionElement
                  .ele('measureClass')
                  .txt(extension.measureClass)
                  .up();
              }
              if (extension.description) {
                extensionElement
                  .ele('description')
                  .txt(extension.description)
                  .up();
              }
            });
          }
        });
      }
    }

    if (bhaRun.commonData) {
      const commonDataElement = bhaRunElement.ele('commonData');
      if (bhaRun.commonData.sourceName) {
        commonDataElement
          .ele('sourceName')
          .txt(bhaRun.commonData.sourceName)
          .up();
      }
      if (bhaRun.commonData.dTimCreation) {
        commonDataElement
          .ele('dTimCreation')
          .txt(bhaRun.commonData.dTimCreation)
          .up();
      }
      if (bhaRun.commonData.dTimLastChange) {
        commonDataElement
          .ele('dTimLastChange')
          .txt(bhaRun.commonData.dTimLastChange)
          .up();
      }
      if (bhaRun.commonData.itemState) {
        commonDataElement
          .ele('itemState')
          .txt(bhaRun.commonData.itemState)
          .up();
      }
      if (bhaRun.commonData.serviceCategory) {
        commonDataElement
          .ele('serviceCategory')
          .txt(bhaRun.commonData.serviceCategory)
          .up();
      }
      if (bhaRun.commonData.comments) {
        commonDataElement.ele('comments').txt(bhaRun.commonData.comments).up();
      }
      if (bhaRun.commonData.acquisitionTimeZone) {
        bhaRun.commonData.acquisitionTimeZone.forEach((timeZone) => {
          commonDataElement
            .ele('acquisitionTimeZone', { dTim: timeZone.dTim })
            .txt(timeZone.offset)
            .up();
        });
      }
      if (bhaRun.commonData.defaultDatum) {
        commonDataElement
          .ele('defaultDatum')
          .txt(bhaRun.commonData.defaultDatum)
          .up();
      }
      if (bhaRun.commonData.privateGroupOnly !== undefined) {
        commonDataElement
          .ele('privateGroupOnly')
          .txt(bhaRun.commonData.privateGroupOnly.toString())
          .up();
      }
      if (bhaRun.commonData.extensionAny) {
        commonDataElement
          .ele('extensionAny')
          .txt(JSON.stringify(bhaRun.commonData.extensionAny))
          .up();
      }
      if (bhaRun.commonData.extensionNameValue) {
        bhaRun.commonData.extensionNameValue.forEach((extension) => {
          const extensionElement = commonDataElement.ele('extensionNameValue');
          extensionElement.ele('name').txt(extension.name).up();
          extensionElement.ele('value').txt(extension.value).up();
          extensionElement.ele('dataType').txt(extension.dataType).up();
          if (extension.dTim) {
            extensionElement.ele('dTim').txt(extension.dTim).up();
          }
          if (extension.md) {
            extensionElement.ele('md').txt(extension.md.toString()).up();
          }
          if (extension.index) {
            extensionElement.ele('index').txt(extension.index.toString()).up();
          }
          if (extension.measureClass) {
            extensionElement
              .ele('measureClass')
              .txt(extension.measureClass)
              .up();
          }
          if (extension.description) {
            extensionElement.ele('description').txt(extension.description).up();
          }
        });
      }
    }

    if (bhaRun.customData) {
      bhaRunElement
        .ele('customData')
        .txt(JSON.stringify(bhaRun.customData))
        .up();
    }

    if (bhaRun.uidWell) {
      bhaRunElement.att('uidWell', bhaRun.uidWell);
    }
    if (bhaRun.uidWellbore) {
      bhaRunElement.att('uidWellbore', bhaRun.uidWellbore);
    }
    if (bhaRun.uid) {
      bhaRunElement.att('uid', bhaRun.uid);
    }
  });

  const xml = root.end({ prettyPrint: true });
  return xml;
}

// Ejemplo de uso
const bhaRuns: ObjBhaRuns = {
  version: '1.4.1.1',
  documentInfo: {
    title: 'Sample BHA Run',
    author: 'John Doe',
    version: '1.0',
  },
  bhaRun: [
    {
      nameWell: 'Well 1',
      nameWellbore: 'Wellbore 1',
      name: 'BHA Run 1',
      bhaRun: {
        tubular: 'Tubular 1',
        dTimStart: '2023-10-01T12:00:00Z',
        dTimStop: '2023-10-02T12:00:00Z',
        drillingParams: [
          {
            eTimOpBit: 'PT12H',
            mdHoleStart: 1000,
            mdHoleStop: 2000,
            hkldRot: 50000,
            overPull: 10000,
            slackOff: 5000,
            hkldUp: 60000,
            hkldDn: 40000,
            tqOnBotAv: 1000,
            tqOnBotMx: 1200,
            tqOnBotMn: 800,
            tqOffBotAv: 900,
            tqDhAv: 950,
            wtAboveJar: 30000,
            wtBelowJar: 20000,
            wtMud: 10.5,
            flowratePump: 500,
            powBit: 100,
            velNozzleAv: 200,
            presDropBit: 500,
            cTimHold: 'PT1H',
            cTimSteering: 'PT2H',
            cTimDrillRot: 'PT8H',
            cTimDrillSlid: 'PT1H',
            cTimCirc: 'PT1H',
            cTimReam: 'PT1H',
            distDrillRot: 1000,
            distDrillSlid: 200,
            distReam: 100,
            distHold: 50,
            distSteering: 150,
            rpmAv: 100,
            rpmMx: 120,
            rpmMn: 80,
            rpmAvDh: 90,
            ropAv: 50,
            ropMx: 60,
            ropMn: 40,
            wobAv: 20000,
            wobMx: 22000,
            wobMn: 18000,
            wobAvDh: 19000,
            reasonTrip: 'Bit wear',
            objectiveBha: 'Drill to target depth',
            aziTop: 45,
            aziBottom: 50,
            inclStart: 10,
            inclMx: 15,
            inclMn: 5,
            inclStop: 12,
            tempMudDhMx: 150,
            presPumpAv: 3000,
            flowrateBit: 400,
            mudClass: 'Water-based',
            mudSubClass: 'Low-toxicity',
            comments: 'Sample drilling parameters',
          },
        ],
      },
      commonData: {
        sourceName: 'http://example.com',
        dTimCreation: '2023-10-01T12:00:00Z',
        comments: 'Sample BHA run',
      },
    },
  ],
};

const xmlOutput = generateWitsmlBhaRuns(bhaRuns);
console.log(xmlOutput);
