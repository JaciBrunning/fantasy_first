Sequel.migration do
  change do
    schema = Sequel[:fantasy_first]
    create_schema(schema)

    create_table(schema[:events]) do
      primary_key :key, type: String
      String :name, null: false
      Boolean :active, default: false     # Is this event running?
      Boolean :drafting, default: false   # Are we accepting drafts?
      Boolean :live, default: false       # Is this event visible?
    end
  end
end