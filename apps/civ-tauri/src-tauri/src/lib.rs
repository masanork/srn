use tauri::command;
use civ::jpki::{JpkiController, BasicInfo};
use civ::native_reader::PcscReader;
use civ::apdu::file_ids; // Need to expose this in lib.rs of civ? It is pub mod.
use serde::Serialize;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[command]
async fn read_jpki_attributes(pin: String) -> Result<BasicInfo, String> {
    println!("Starting JPKI Attribute Read...");
    
    // 1. Create Native PC/SC Reader
    let mut reader = PcscReader::new()
        .map_err(|e| format!("PC/SC Init Failed: {}", e))?;
    
    // 2. Connect to Reader/Card (Auto-detect)
    println!("Connecting to card reader...");
    reader.connect()
        .map_err(|e| format!("Card Connection Failed: {}", e))?;
        
    // 3. Create Controller
    let mut controller = JpkiController::new(reader);
    
    // 4. Read Attributes
    println!("Reading attributes with PIN: ****");
    let info = controller.read_attributes(&pin).await
        .map_err(|e| format!("JPKI Access Error: {}", e))?;
        
    println!("Read Success: {}", info.name);
    Ok(info)
}

#[derive(Serialize)]
struct PinRetryStatus {
    auth: String,
    sign: String,
    input_support: String,
    face_recognition: String,
}

fn format_pin_retries(retries: u8) -> String {
    if retries == 255 {
        "VERIFIED (Unlocked)".to_string()
    } else {
        format!("Remaining Retries: {}", retries)
    }
}

#[command]
async fn check_pin_status() -> Result<String, String> {
    let mut reader = PcscReader::new().map_err(|e| format!("PC/SC Init Failed: {}", e))?;
    reader.connect().map_err(|e| format!("Card Connection Failed: {}", e))?;
    let mut controller = JpkiController::new(reader);
    
    // Select Input Support AP
    controller.select_input_support_ap().await.map_err(|e| format!("Select AP Failed: {}", e))?;
    
    // Check PIN status (Auth PIN: 0011 for Input Support)
    let retries = controller.get_pin_retry_count(&file_ids::EF_INPUT_SUPPORT_PIN)
        .await
        .map_err(|e| format!("Get Retry Count Failed: {}", e))?;
        
    Ok(format_pin_retries(retries))
}

#[command]
async fn check_all_pin_statuses() -> Result<PinRetryStatus, String> {
    let mut reader = PcscReader::new().map_err(|e| format!("PC/SC Init Failed: {}", e))?;
    reader.connect().map_err(|e| format!("Card Connection Failed: {}", e))?;
    let mut controller = JpkiController::new(reader);

    controller.select_jpki_ap().await.map_err(|e| format!("Select JPKI AP Failed: {}", e))?;
    let auth = controller.get_pin_retry_count(&file_ids::EF_AUTH_PIN)
        .await
        .map_err(|e| format!("Auth PIN Retry Count Failed: {}", e))?;
    let sign = controller.get_pin_retry_count(&file_ids::EF_SIGN_PIN)
        .await
        .map_err(|e| format!("Sign PIN Retry Count Failed: {}", e))?;

    controller.select_input_support_ap().await.map_err(|e| format!("Select Input Support AP Failed: {}", e))?;
    let input_support = controller.get_pin_retry_count(&file_ids::EF_INPUT_SUPPORT_PIN)
        .await
        .map_err(|e| format!("Input Support PIN Retry Count Failed: {}", e))?;

    controller.select_face_recognition_ap().await.map_err(|e| format!("Select Face Recognition AP Failed: {}", e))?;
    let face_recognition = controller.get_pin_retry_count(&file_ids::EF_FACE_RECOGNITION_PIN)
        .await
        .map_err(|e| format!("Face Recognition PIN Retry Count Failed: {}", e))?;

    Ok(PinRetryStatus {
        auth: format_pin_retries(auth),
        sign: format_pin_retries(sign),
        input_support: format_pin_retries(input_support),
        face_recognition: format_pin_retries(face_recognition),
    })
}

#[command]
async fn debug_dump_ef(ef_hex: String) -> Result<String, String> {
    let mut reader = PcscReader::new().map_err(|e| format!("PC/SC Init Failed: {}", e))?;
    reader.connect().map_err(|e| format!("Card Connection Failed: {}", e))?;
    let mut controller = JpkiController::new(reader);
    
    // Select Input Support AP (Default target for now)
    controller.select_input_support_ap().await.map_err(|e| format!("Select AP Failed: {}", e))?;
    
    // Verify PIN? Some EFs require PIN. But dump might be used before PIN.
    // If PIN is needed, it will fail with Security Status Not Satisfied.
    // For now, no PIN verify here. User should know constraints.
    
    let ef_bytes = hex::decode(&ef_hex).map_err(|e| format!("Invalid Hex: {}", e))?;
    let data = controller.read_ef_full(&ef_bytes).await.map_err(|e| format!("Read EF Failed: {}", e))?;
    
    Ok(hex::encode(data))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            read_jpki_attributes,
            check_pin_status,
            check_all_pin_statuses,
            debug_dump_ef
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
