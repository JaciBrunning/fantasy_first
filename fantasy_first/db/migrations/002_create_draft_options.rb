Sequel.migration do
  change do
    schema = Sequel[:fantasy_first]
    
    create_table(schema[:draft_options]) do
      String :event_key, null: false
      Integer :team, null: false
      Integer :cost, default: 0
      Boolean :pickable, default: true

      primary_key [:team, :event_key]
      foreign_key [:event_key], schema[:events], on_delete: :cascade
    end
  end
end