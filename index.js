const diymodelsel = document.getElementById('diymodelsel');
const connectButton = document.getElementById('connectButton');
const eraseButton = document.getElementById('eraseButton');
const btprogressBar = document.getElementById('bootloaderprogress');
const btprogressBarLbl = document.getElementById('bootloaderprogresslbl');
const otaprogressBar = document.getElementById('otaprogress');
const otaprogressBarLbl = document.getElementById('otaprogresslbl');
const ptprogressBar = document.getElementById('partitiontableprogress');
const ptprogressBarLbl = document.getElementById('partitiontableprogresslbl');
const firmwareprogressBar = document.getElementById('firmwareprogress');
const firmwareprogressBarlbl = document.getElementById('firmwareprogresslbl');
const lbldiymodels = document.getElementById('lbldiymodels');

// import { Transport } from './cp210x-webusb.js'
import * as esptooljs from "./bundle.js";
const ESPLoader = esptooljs.ESPLoader;
const Transport = esptooljs.Transport;

let device = null;
let transport;
let chip = null;
let esploader;

function addToLog(message) {
  const log = document.getElementById('log');
  log.textContent += message + '\n';
  log.scrollTop = log.scrollHeight; // Scroll to the bottom
}

eraseButton.onclick = async () => {
  connectButton.style.display = 'none';
  eraseButton.style.display = 'none';
  lbldiymodels.style.display = 'none';
  diymodelsel.style.display = 'none';
  document.getElementById("success").innerHTML = ``;
  addToLog('Starting flash erase process...');
  if (device === null) {
    device = await navigator.serial.requestPort({});
    transport = new Transport(device);
  }

  const spinner = document.getElementById("loadingSpinner");
  spinner.style.display = 'block'; 

  var baudrate = 115200;

  try {
      esploader = new ESPLoader(transport, baudrate, null);
      chip = await esploader.main_fn();
      addToLog(`Connected to chip: ${chip}`);
      addToLog('Erasing flash... please wait');
      await esploader.erase_flash();
      addToLog('Erase flash complete.');
      document.getElementById("success").innerHTML = "Successfully erased flash memory";
  } catch (e) {
      console.error(e);
      addToLog(`Erasing flash failed: ${e}`);
      document.getElementById("success").innerHTML = `Erasing flash failed: ${e}`;
  } finally {
      // Restore the DTR (Data Terminal Ready) line to its default state
      await new Promise((resolve) => setTimeout(resolve, 100));
      await transport.setDTR(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await transport.setDTR(true);

      // Restore the visibility of the UI elements
      eraseButton.style.display = 'block';
      connectButton.style.display = 'block';
      lbldiymodels.style.display = 'block';
      diymodelsel.style.display = 'block';
      spinner.style.display = 'none'; 
  }
};


connectButton.onclick = async () => {
  connectButton.style.display = 'none';
  eraseButton.style.display = 'none';
  lbldiymodels.style.display = 'none';
  diymodelsel.style.display = 'none';
  addToLog('Starting flash process...');
  if (device === null) {
    device = await navigator.serial.requestPort({});
    transport = new Transport(device);
  }

  // Check if the selected model is not NerdAxe to display progress bars
  if ((diymodelsel.value != "nerdAxe_2.1.4")&&(diymodelsel.value != "nerdAxe_2.1.5")) {
    btprogressBar.style.display = 'block';
    otaprogressBar.style.display = 'block';
    ptprogressBar.style.display = 'block';
    btprogressBarLbl.style.display = 'block';
    otaprogressBarLbl.style.display = 'block';
    ptprogressBarLbl.style.display = 'block';
  }

  firmwareprogressBar.style.display = 'block';
  firmwareprogressBarlbl.style.display = 'block';

  var baudrate = 921600;

  try {
        esploader = new ESPLoader(transport, baudrate, null);
        chip = await esploader.main_fn();
        addToLog(`Connected to chip: ${chip}`);
    } catch (e) {
        console.error(e);
        addToLog(`Error connecting to chip: ${e}`);
    }


  let addressesAndFiles = [
    {address: '0x1000', fileName: 'bootloader.bin', progressBar: btprogressBar},
    {address: '0x9000', fileName: 'partition-table.bin', progressBar: ptprogressBar},
    {address: '0xE000', fileName: 'ota_data_initial.bin', progressBar: otaprogressBar},
    {address: '0x10000', fileName: 'jade.bin', progressBar: firmwareprogressBar},
  ];  

  if (diymodelsel.value.includes("github-assets")) { // github nerdminer releases
    if(["S3","C3","T-QT","T-Embed","NerminerV2","NerdminerV2"].some(val => diymodelsel.value.includes(val))){
      addressesAndFiles = [
        {address: '0x0000', fileName: 'bootloader.bin', progressBar: btprogressBar},
        {address: '0x8000', fileName: 'partitions.bin', progressBar: ptprogressBar},
        {address: '0xE000', fileName: 'boot_app0.bin', progressBar: otaprogressBar},
        {address: '0x10000', fileName: 'firmware.bin', progressBar: firmwareprogressBar},
      ];
    } else {
      addressesAndFiles = [
        {address: '0x1000', fileName: 'bootloader.bin', progressBar: btprogressBar},
        {address: '0x8000', fileName: 'partitions.bin', progressBar: ptprogressBar},
        {address: '0xE000', fileName: 'boot_app0.bin', progressBar: otaprogressBar},
        {address: '0x10000', fileName: 'firmware.bin', progressBar: firmwareprogressBar},
      ];
    }
  }
  else if (["han_0.0.1_m5stack"].includes(diymodelsel.value)) { // han
    addressesAndFiles = [
      {address: '0x1000', fileName: 'bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: 'partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: 'boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: 'firmware.bin', progressBar: firmwareprogressBar},
    ];
  } else if (["han2_0.0.1_wt32-sc01", "han2_0.0.1_wt32-sc01-plus"].includes(diymodelsel.value)) { // han2
    addressesAndFiles = [
      {address: '0x1000', fileName: 'bootloader.bin', progressBar: btprogressBar},
      {address: '0x9000', fileName: 'partition-table.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: 'ota_data_initial.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: 'firmware.bin', progressBar: firmwareprogressBar},
    ];
  } else if (["nerdminer2_1.6.3_tdisplays3"].includes(diymodelsel.value)) { // nerd
    addressesAndFiles = [
      {address: '0x0000', fileName: '0x0000_bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: '0x8000_partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: '0xe000_boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: '0x10000_firmware.bin', progressBar: firmwareprogressBar},
   ];
  } else if (["nerdminer2_1.6.3_esp32wroom"].includes(diymodelsel.value)) { // nerd WROOM
    addressesAndFiles = [
      {address: '0x1000', fileName: '0x1000_bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: '0x8000_partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: '0xe000_boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: '0x10000_firmware.bin', progressBar: firmwareprogressBar},
   ];
   } else if (["nerdminer2_1.6.3_tdiplay_S3_Amoled"].includes(diymodelsel.value)) { // nerd WROOM
    addressesAndFiles = [
      {address: '0x0000', fileName: '0x0000_bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: '0x8000_partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: '0xe000_boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: '0x10000_firmware.bin', progressBar: firmwareprogressBar},
   ];
      } else if (["nerdminer2_1.6.3_T_QT"].includes(diymodelsel.value)) { // nerd WROOM
    addressesAndFiles = [
      {address: '0x0000', fileName: '0x0000_bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: '0x8000_partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: '0xe000_boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: '0x10000_firmware.bin', progressBar: firmwareprogressBar},
   ];
    } else if (["nerdminer2_1.6.3_tdisplayv1"].includes(diymodelsel.value)) { // nerd WROOM
    addressesAndFiles = [
      {address: '0x1000', fileName: '0x1000_bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: '0x8000_partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: '0xe000_boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: '0x10000_firmware.bin', progressBar: firmwareprogressBar},
   ];
    } else if (["nerdminer2_1.6.3_s3Dongle"].includes(diymodelsel.value)) { // nerd WROOM
    addressesAndFiles = [
      {address: '0x0000', fileName: '0x0000_bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: '0x8000_partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: '0xe000_boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: '0x10000_firmware.bin', progressBar: firmwareprogressBar},
   ];
   } else if (["nerdminer2_1.6.3_ESP32-2432S028R"].includes(diymodelsel.value)) { // nerd WROOM
    addressesAndFiles = [
      {address: '0x1000', fileName: '0x1000_bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: '0x8000_partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: '0xe000_boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: '0x10000_firmware.bin', progressBar: firmwareprogressBar},
   ];
  } else if (["nerdminer2_1.6.3_M5-StampS3"].includes(diymodelsel.value)) { // nerd WROOM
    addressesAndFiles = [
      {address: '0x0000', fileName: '0x0000_bootloader.bin', progressBar: btprogressBar},
      {address: '0x8000', fileName: '0x8000_partitions.bin', progressBar: ptprogressBar},
      {address: '0xE000', fileName: '0xe000_boot_app0.bin', progressBar: otaprogressBar},
      {address: '0x10000', fileName: '0x10000_firmware.bin', progressBar: firmwareprogressBar},
   ];
   } else if (["nerdAxe_2.1.4"].includes(diymodelsel.value)) { // nerdaxe
    addressesAndFiles = [
      {address: '0x0000', fileName: 'esp-miner-factory-nerd101-v2.1.4.bin', progressBar: firmwareprogressBar},
   ]; 
   } else if (["nerdAxe_2.1.5"].includes(diymodelsel.value)) { // nerdaxe
    addressesAndFiles = [
      {address: '0x0000', fileName: 'esp-miner-factory-nerd101-v2.1.5.bin', progressBar: firmwareprogressBar},
   ]; 
   }


  // Rest of the code
  let fileArray = [];

  for (const item of addressesAndFiles) {
        try {
          var response;
          if(!diymodelsel.value.includes("github-assets")){
            addToLog(`Fetching: assets/${diymodelsel.value}/${item.fileName}`);
            response = await fetch(`assets/${diymodelsel.value}/${item.fileName}`);
          } else {
            if(item.fileName.includes("boot_app0.bin")){              
              addToLog(`Fetching: ${diymodelsel.value.substring(0, diymodelsel.value.lastIndexOf("/") + 1)}${item.fileName}`);
              response = await fetch(`${diymodelsel.value.substring(0, diymodelsel.value.lastIndexOf("/") + 1)}${item.fileName}`);
            } else {
              addToLog(`Fetching: ${diymodelsel.value}_${item.fileName}`);
              response = await fetch(`${diymodelsel.value}_${item.fileName}`);
            }            
          }
           
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for file ${item.fileName}`);
            }
            const fileBlob = await response.blob();
            const fileData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsBinaryString(fileBlob);
            });
            fileArray.push({
                data: fileData,
                address: item.address
            });
            addToLog(`Fetched: ${item.fileName}`);
        } catch (e) {
            console.error(e);
            addToLog(`Failed to fetch or process file ${item.fileName}: ${e}`);
            document.getElementById("success").innerHTML = `Failed to fetch or process file ${item.fileName}: ${e}`;
            return;  // Exit the function if there's an error
        }
    }

  try {
    await esploader.write_flash(
      fileArray,
      'keep',
      'keep',
      'keep',
      false,
      true,
      (fileIndex, written, total) => {
        addressesAndFiles[fileIndex].progressBar.value = (written / total) * 100;
        addToLog(`Flashing ${addressesAndFiles[fileIndex].fileName}: ${((written / total) * 100).toFixed(2)}%`);
      },
      null
    );
      addToLog('Flashing complete.');
  } catch (e) {
    console.error(e);
    addToLog(`Flashing failed: ${e}`);
    document.getElementById("success").innerHTML = `Flashing failed: ${e}`;
    return;  // Exit the function if there's an error
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
  await transport.setDTR(false);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await transport.setDTR(true);
  document.getElementById("success").innerHTML = "Successfully flashed " + diymodelsel.options[diymodelsel.selectedIndex].text;
};
