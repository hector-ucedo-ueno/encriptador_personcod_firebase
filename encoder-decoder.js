#!/usr/bin/env node

// encoder-decoder-node.js - Versión Node.js
const readline = require('readline');

// --- MATRIZ SEGURA Y REDISTRIBUIDA (8 caracteres por dígito) ---
const SustitucionMatrix = {
    '0': ['@', '!', '#', '$', '%', '^', '&', '*'],
    '1': ['(', ')', 'a', 'b', 'c', 'd', 'e', 'f'],
    '2': ['g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'],
    '3': ['o', 'p', 'q', 'r', 's', 't', 'u', 'v'],
    '4': ['w', 'x', 'y', 'z', 'A', 'B', 'C', 'D'],
    '5': ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    '6': ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
    '7': ['U', 'V', 'W', 'X', 'Y', 'Z', '-', '_'],
    '8': ['=', '+', '[', ']', '{', '}', '|', ':'],
    '9': [';', '<', '>', ',', '.', '?', '/', '~']
};
// --- CONFIGURACIÓN MULTIPLATAFORMA ---
const IS_WINDOWS = process.platform === 'win32';
const CLEAR_COMMAND = IS_WINDOWS ? 'cls' : 'clear';

// --- VERIFICACIÓN TEMPORAL (solo en Node.js) ---
/*function verificarMatrizCompatibilidad() {
    console.log('🔍 Verificando compatibilidad de matriz...');
    
    let todosCompatibles = true;
    let totalCaracteres = 0;
    
    for (const digito in SustitucionMatrix) {
        console.log(`\n🔢 Dígito ${digito}:`);
        SustitucionMatrix[digito].forEach((caracter, index) => {
            const byteLength = Buffer.from(caracter).length;
            const esCompatible = byteLength === 1;
            totalCaracteres++;
            
            console.log(`   ${index}: '${caracter}' -> ${byteLength} byte${byteLength !== 1 ? 's ❌' : ' ✅'}`);
            
            if (!esCompatible) {
                todosCompatibles = false;
            }
        });
    }
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total caracteres: ${totalCaracteres}`);
    console.log(`   Compatibilidad: ${todosCompatibles ? '✅ 100% COMPATIBLE' : '❌ INCOMPATIBLE'}`);
    
    return todosCompatibles;
}

// Ejecutar la verificación una vez al inicio
console.log('=== VERIFICACIÓN DE MATRIZ COMPATIBLE ===');
verificarMatrizCompatibilidad();
console.log('=== FIN VERIFICACIÓN ===\n');*/

// --- VERIFICACIÓN DE MATRIZ FIJA ---
/*function verificarMatrizFija() {
    console.log('🔍 Verificando matriz fija...');
    
    const todosCaracteres = new Set();
    const duplicados = [];
    
    for (const digito in SustitucionMatrix) {
        SustitucionMatrix[digito].forEach(caracter => {
            if (todosCaracteres.has(caracter)) {
                duplicados.push({caracter, digito});
            }
            todosCaracteres.add(caracter);
        });
    }
    
    if (duplicados.length > 0) {
        console.log('❌ SE ENCONTRARON DUPLICADOS:', duplicados);
        return false;
    }
    
    // Verificar que no hay números
    const numerosEncontrados = [];
    for (const digito in SustitucionMatrix) {
        SustitucionMatrix[digito].forEach(caracter => {
            if (/^\d$/.test(caracter)) {
                numerosEncontrados.push({caracter, digito});
            }
        });
    }
    
    if (numerosEncontrados.length > 0) {
        console.log('❌ SE ENCONTRARON NÚMEROS:', numerosEncontrados);
        return false;
    }
    
    console.log('✅ Matriz fija verificada: 0 duplicados encontrados');
    console.log('✅ Matriz verificada: 0 números encontrados');
    console.log(`✅ Total de caracteres únicos: ${todosCaracteres.size}`);
    console.log('✅ Esta matriz será CONSISTENTE entre ejecuciones');
    return true;
}*/

// --- BASE64 COMPATIBLE (USANDO BUFFER EN NODE.JS) ---
function base64Encode(str) {
    return Buffer.from(str, 'utf8').toString('base64');
}

function base64Decode(str) {
    return Buffer.from(str, 'base64').toString('utf8');
}

// --- GENERACIÓN DE MATRIZ INVERSA ---
const InversaMatrix = {};
for (const digito in SustitucionMatrix) {
    SustitucionMatrix[digito].forEach(simbolo => {
        InversaMatrix[simbolo] = digito;
    });
}

function getRandomIndex(digito) {
    const opciones = SustitucionMatrix[digito];
    return Math.floor(Math.random() * opciones.length);
}

// Funciones de detección de estado
function isDecoded(str) {
    return /^\d+$/.test(str);
}

function isBase64(str) {
    try {
        if (str.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
            return false;
        }
        const decoded = base64Decode(str);
        return decoded.length > 0;
    } catch (e) {
        return false;
    }
}

function canBeDecodedFromSubstitution(str) {
    for (let i = 0; i < str.length; i++) {
        if (InversaMatrix[str[i]] === undefined) {
            return false;
        }
    }
    return true;
}

/**
 * Codifica una cadena de IDs (separados por coma).
 */
function encode(params) {
    if (!params) return "";
    
    const ids = params.split(',').map(id => id.trim()).filter(id => id.length > 0);
    
    const encodedIds = ids.map(id => {
        if (isBase64(id)) {
            try {
                const decodedFromBase64 = base64Decode(id);
                if (canBeDecodedFromSubstitution(decodedFromBase64)) {
                    return id;
                }
            } catch (e) {
                // Continuar con codificación normal
            }
        }
        
        if (isDecoded(id)) {
            let ofuscado = '';
            
            for (let i = 0; i < id.length; i++) {
                const digito = id[i];
                if (SustitucionMatrix[digito]) {
                    const randomIndex = getRandomIndex(digito);
                    ofuscado += SustitucionMatrix[digito][randomIndex];
                } else {
                    ofuscado += digito;
                }
            }
            
            return base64Encode(ofuscado);
        }
        
        return id;
    });

    return encodedIds.join(',');
}

/**
 * Decodifica una cadena de IDs (separados por coma).
 */
function decode(params) {
    if (!params) return "";
    
    const ids = params.split(',').map(id => id.trim()).filter(id => id.length > 0);

    const decodedIds = ids.map(id => {
        if (isDecoded(id)) {
            return id;
        }

        if (isBase64(id)) {
            try {
                const ofuscado = base64Decode(id);
                
                if (canBeDecodedFromSubstitution(ofuscado)) {
                    let restaurado = '';

                    for (let i = 0; i < ofuscado.length; i++) {
                        const caracter = ofuscado[i];
                        if (InversaMatrix[caracter] !== undefined) {
                            restaurado += InversaMatrix[caracter];
                        } else {
                            return id;
                        }
                    }
                    
                    return restaurado;
                }
            } catch (e) {
                // Si hay error, devolver original
            }
        }
        
        return id;
    });

    return decodedIds.join(',');
}

// --- INTERFAZ INTERACTIVA MULTIPLATAFORMA ---
class MultiPlatformEncoderDecoder {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        // Verificar la matriz fija al iniciar
        /*if (!verificarMatrizFija()) {
            console.log('❌ ERROR: La matriz fija tiene problemas.');
            process.exit(1);
        }*/
    }

    clearScreen() {
        const { execSync } = require('child_process');
        try {
            execSync(CLEAR_COMMAND, { stdio: 'ignore' });
        } catch (error) {
            console.log('\n'.repeat(50));
        }
    }

    async start() {
        this.clearScreen();
        this.showWelcome();
        await this.mainLoop();
    }

    showWelcome() {
        console.log('═'.repeat(60));
        console.log(' 🚀 ENCODER/DECODER - MATRIZ FIJA / Base64 ');
        console.log('═'.repeat(60));
        console.log('✅ Matriz CONSISTENTE entre ejecuciones');
        console.log('✅ Sin números en los caracteres de sustitución');
        console.log('✅ Sin duplicados - ASCII seguro');
        console.log('🔐 Los encodes funcionarán siempre, incluso después de reiniciar');
        console.log('');
    }

    async mainLoop() {
        let continuar = true;
        
        while (continuar) {
            console.log('📋 OPCIONES DISPONIBLES:');
            console.log('   1. Codificar (encode)');
            console.log('   2. Decodificar (decode)');
            console.log('   3. Probar consistencia');
            console.log('   4. Salir');
            
            const opcion = await this.question('\n👉 Selecciona una opción (1-4): ');
            
            switch (opcion.trim()) {
                case '1':
                    await this.procesarOperacion('encode');
                    break;
                case '2':
                    await this.procesarOperacion('decode');
                    break;
                case '3':
                    await this.probarConsistencia();
                    break;
                case '4':
                    console.log('\n👋 ¡Hasta pronto!');
                    this.rl.close();
                    return; // Salir directamente
                default:
                    console.log('\n❌ Opción no válida. Por favor selecciona 1-4.');
            }
            
            // Preguntar si quiere continuar SOLO si no eligió salir
            if (opcion.trim() !== '4') {
                continuar = await this.continuarPrograma();
            }
        }
        
        console.log('\n👋 ¡Hasta pronto!');
        this.rl.close();
    }

    async procesarOperacion(tipo) {
        console.log(`\n${tipo === 'encode' ? '🔒' : '🔓'} ${tipo.toUpperCase()}`);
        console.log('─'.repeat(40));
        
        const ejemplos = tipo === 'encode' 
            ? 'Ej: 23466777 o 45678906, 76448899, ...'
            : 'Ej: [resultado-base64-de-este-programa]';
            
        console.log(`Ingresa los IDs (separados por coma):`);
        console.log(`💡 ${ejemplos}`);
        
        const input = await this.question('\n📥 IDs: ');
        
        if (!input.trim()) {
            console.log('⚠️  No se ingresó ningún ID.');
            return;
        }

        const inicioTiempo = Date.now();
        let resultado;
        
        try {
            if (tipo === 'encode') {
                resultado = encode(input);
            } else {
                resultado = decode(input);
            }
            
            const tiempoProcesamiento = Date.now() - inicioTiempo;
            
            console.log('\n✅ RESULTADO:');
            console.log('═'.repeat(60));
            console.log('📊 Entrada:', input);
            console.log('\n🎯 Salida: ', resultado);
            console.log('═'.repeat(60));
            console.log(`⏱️  Tiempo: ${tiempoProcesamiento}ms`);
            
            this.mostrarDetalle(input, resultado, tipo);
            
        } catch (error) {
            console.log('\n❌ Error durante el procesamiento:');
            console.log('   ', error.message);
        }
    }

    async probarConsistencia() {
        console.log('\n🧪 PROBAR CONSISTENCIA ENTRE EJECUCIONES');
        console.log('─'.repeat(50));
        
        const testID = await this.question('Ingresa un ID para probar (ej: 2355489): ');
        
        if (!testID.trim() || !isDecoded(testID)) {
            console.log('❌ ID no válido para prueba.');
            return;
        }

        console.log('\n🔍 Probando codificación...');
        const encoded = encode(testID);
        console.log(`✅ Codificado: ${encoded}`);
        
        console.log('\n🔍 Probando decodificación inmediata...');
        const decoded = decode(encoded);
        const correctoInmediato = decoded === testID;
        console.log(`✅ Decodificado: ${decoded} ${correctoInmediato ? '✅' : '❌'}`);
        
        if (correctoInmediato) {
            console.log('\n🎉 ¡EXCELENTE! La consistencia está garantizada.');
            console.log('   Puedes codificar ahora, cerrar el programa, y decodificar después.');
        } else {
            console.log('\n❌ Hay problemas de consistencia.');
        }
    }

    mostrarDetalle(input, resultado, tipo) {
        const ids = input.split(',').map(id => id.trim()).filter(id => id.length > 0);
        const resultados = resultado.split(',');
        
        if (ids.length > 1) {
            console.log('\n📋 Detalle por ID:');
            ids.forEach((id, i) => {
                const flecha = tipo === 'encode' ? '→' : '←';
                console.log(`   ${id} ${flecha} ${resultados[i]}`);
            });
        }
    }

    async continuarPrograma() {
        const respuesta = await this.question('\n🔄 ¿Deseas realizar otra operación? (s/n): ');
        return ['s', 'si', 'sí', 'yes', 'y'].includes(respuesta.toLowerCase().trim());
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// --- MANEJO DE ERRORES ---
process.on('SIGINT', () => {
    console.log('\n\n👋 ¡Hasta pronto!');
    process.exit(0);
});

// --- INICIALIZACIÓN ---
if (require.main === module) {
    const app = new MultiPlatformEncoderDecoder();
    app.start().catch(error => {
        console.error('Error al iniciar la aplicación:', error);
        process.exit(1);
    });
}