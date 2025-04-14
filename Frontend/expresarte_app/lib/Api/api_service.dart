import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  final String baseUrl = 'http://localhost:8000/api'; // Cambiar si usas IP real
  final logger = Logger(); // Nuevo logger

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  Future<String?> login(String email, String password) async {
    try {
      logger.i('Enviando login con email: $email y password: $password');

      final response = await http.post(
        Uri.parse('$baseUrl/login/'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        logger.i('Respuesta completa: $data');

        final token = data['tokens']['access'];
        logger.i('Login exitoso. Token: $token');

        await saveToken(token); // ✅ Guarda el token

        return token;
      } else {
        logger.e('Error login: ${response.body}');
        return null;
      }
    } catch (e) {
      logger.e('Excepción en login: $e');
      return null;
    }
  }

  Future<bool> register(String username, String email, String password) async {
    final url = Uri.parse('$baseUrl/register/');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'nombre': username,
        'email': email,
        'password': password,
      }),
    );

    return response.statusCode == 200;
  }

  Future<http.Response> getProtectedData(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/alguna-vista-protegida/'),
        headers: {'Authorization': 'Bearer $token'},
      );

      logger.i('Respuesta protegida: ${response.body}');
      return response;
    } catch (e) {
      logger.e('Excepción al obtener datos protegidos: $e');
      rethrow;
    }
  }
}
