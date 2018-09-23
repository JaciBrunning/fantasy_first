Sequel.migration do
  change do
    schema = Sequel[:fantasy_first]

    alter_table(schema[:events]) do
      add_column :alliance_json, String, default: '{}'
    end
  end
end
