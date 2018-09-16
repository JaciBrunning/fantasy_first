Sequel.migration do
  change do
    schema = Sequel[:fantasy_first]
    
    create_table(schema[:draft_teams]) do
      primary_key :id, type: :uuid
      String :event_key, null: false
      String :team_name, null: false
      String :team_email, null: false
      String :picks_json, null: false  # JSON since we will never have to edit a single pick at once - picks are final

      index Sequel.function(:lower, :team_name)
      index Sequel.function(:lower, :team_email)

      foreign_key [:event_key], schema[:events], on_delete: :cascade

      unique [:event_key, :team_name]
      unique [:event_key, :team_email]
    end
  end
end