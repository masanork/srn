use tauri::command;
use civ::jpki::{JpkiController, Basic4Info};
use civ::native_reader::PcscReader;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[command]
async fn read_jpki_attributes(pin: String) -> Result<Basic4Info, String> {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![read_jpki_attributes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
