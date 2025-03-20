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

interface GrpAttachment {
  objectReference?: string;
  subObjectReference?: string;
  md?: number;
  mdBit?: number;
  param?: { name: string; value: number; index: number }[];
  fileName?: string;
  description?: string;
  fileType?: string;
  content: string; // Base64 encoded content
}

interface ObjAttachment {
  nameWell: string;
  nameWellbore?: string;
  name: string;
  attachment?: GrpAttachment;
  commonData?: CsCommonData;
  customData?: any; // Custom data can be any structure
  uidWell?: string;
  uidWellbore?: string;
  uid?: string;
}

interface ObjAttachments {
  documentInfo?: { title: string; author: string; version: string };
  attachment: ObjAttachment[];
  version: string;
}

// Función para generar el XML de WITSML
function generateWitsmlAttachments(attachments: ObjAttachments): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele(
    'attachments',
    { version: attachments.version },
  );

  if (attachments.documentInfo) {
    root
      .ele('documentInfo')
      .ele('title')
      .txt(attachments.documentInfo.title)
      .up()
      .ele('author')
      .txt(attachments.documentInfo.author)
      .up()
      .ele('version')
      .txt(attachments.documentInfo.version)
      .up();
  }

  attachments.attachment.forEach((attachment) => {
    const attachmentElement = root
      .ele('attachment')
      .ele('nameWell')
      .txt(attachment.nameWell)
      .up()
      .ele('name')
      .txt(attachment.name)
      .up();

    if (attachment.nameWellbore) {
      attachmentElement.ele('nameWellbore').txt(attachment.nameWellbore).up();
    }

    if (attachment.attachment) {
      const grpAttachment = attachmentElement.ele('attachment');
      if (attachment.attachment.objectReference) {
        grpAttachment
          .ele('objectReference')
          .txt(attachment.attachment.objectReference)
          .up();
      }
      if (attachment.attachment.subObjectReference) {
        grpAttachment
          .ele('subObjectReference')
          .txt(attachment.attachment.subObjectReference)
          .up();
      }
      if (attachment.attachment.md) {
        grpAttachment.ele('md').txt(attachment.attachment.md.toString()).up();
      }
      if (attachment.attachment.mdBit) {
        grpAttachment
          .ele('mdBit')
          .txt(attachment.attachment.mdBit.toString())
          .up();
      }
      if (attachment.attachment.param) {
        attachment.attachment.param.forEach((param) => {
          grpAttachment
            .ele('param', { name: param.name, index: param.index.toString() })
            .txt(param.value.toString())
            .up();
        });
      }
      if (attachment.attachment.fileName) {
        grpAttachment.ele('fileName').txt(attachment.attachment.fileName).up();
      }
      if (attachment.attachment.description) {
        grpAttachment
          .ele('description')
          .txt(attachment.attachment.description)
          .up();
      }
      if (attachment.attachment.fileType) {
        grpAttachment.ele('fileType').txt(attachment.attachment.fileType).up();
      }
      grpAttachment.ele('content').txt(attachment.attachment.content).up();
    }

    if (attachment.commonData) {
      const commonDataElement = attachmentElement.ele('commonData');
      if (attachment.commonData.sourceName) {
        commonDataElement
          .ele('sourceName')
          .txt(attachment.commonData.sourceName)
          .up();
      }
      if (attachment.commonData.dTimCreation) {
        commonDataElement
          .ele('dTimCreation')
          .txt(attachment.commonData.dTimCreation)
          .up();
      }
      if (attachment.commonData.dTimLastChange) {
        commonDataElement
          .ele('dTimLastChange')
          .txt(attachment.commonData.dTimLastChange)
          .up();
      }
      if (attachment.commonData.itemState) {
        commonDataElement
          .ele('itemState')
          .txt(attachment.commonData.itemState)
          .up();
      }
      if (attachment.commonData.serviceCategory) {
        commonDataElement
          .ele('serviceCategory')
          .txt(attachment.commonData.serviceCategory)
          .up();
      }
      if (attachment.commonData.comments) {
        commonDataElement
          .ele('comments')
          .txt(attachment.commonData.comments)
          .up();
      }
      if (attachment.commonData.acquisitionTimeZone) {
        attachment.commonData.acquisitionTimeZone.forEach((timeZone) => {
          commonDataElement
            .ele('acquisitionTimeZone', { dTim: timeZone.dTim })
            .txt(timeZone.offset)
            .up();
        });
      }
      if (attachment.commonData.defaultDatum) {
        commonDataElement
          .ele('defaultDatum')
          .txt(attachment.commonData.defaultDatum)
          .up();
      }
      if (attachment.commonData.privateGroupOnly !== undefined) {
        commonDataElement
          .ele('privateGroupOnly')
          .txt(attachment.commonData.privateGroupOnly.toString())
          .up();
      }
      if (attachment.commonData.extensionAny) {
        commonDataElement
          .ele('extensionAny')
          .txt(JSON.stringify(attachment.commonData.extensionAny))
          .up();
      }
      if (attachment.commonData.extensionNameValue) {
        attachment.commonData.extensionNameValue.forEach((extension) => {
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

    if (attachment.customData) {
      attachmentElement
        .ele('customData')
        .txt(JSON.stringify(attachment.customData))
        .up();
    }

    if (attachment.uidWell) {
      attachmentElement.att('uidWell', attachment.uidWell);
    }
    if (attachment.uidWellbore) {
      attachmentElement.att('uidWellbore', attachment.uidWellbore);
    }
    if (attachment.uid) {
      attachmentElement.att('uid', attachment.uid);
    }
  });

  const xml = root.end({ prettyPrint: true });
  return xml;
}

// Ejemplo de uso
const attachments: ObjAttachments = {
  version: '1.4.1.1',
  documentInfo: {
    title: 'Sample Attachment',
    author: 'John Doe',
    version: '1.0',
  },
  attachment: [
    {
      nameWell: 'Well 1',
      name: 'Attachment 1',
      attachment: {
        content: 'Base64EncodedContentHere',
      },
      commonData: {
        sourceName: 'http://example.com',
        dTimCreation: '2023-10-01T12:00:00Z',
        comments: 'Sample attachment',
      },
    },
  ],
};

const xmlOutput = generateWitsmlAttachments(attachments);
console.log(xmlOutput);
