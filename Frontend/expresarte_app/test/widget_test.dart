import 'package:flutter_test/flutter_test.dart';
import 'package:expresarte_app/main.dart';

void main() {
  testWidgets('Login screen renders correctly', (WidgetTester tester) async {
    // Cargar la app principal
    await tester.pumpWidget(const LoadingApp());

    // Esperar a que se resuelva el FutureBuilder (si estás usando uno)
    await tester.pumpAndSettle();

    // Verificar que exista el texto 'Iniciar sesión'
    expect(find.text('Iniciar sesión'), findsOneWidget);
  });
}
